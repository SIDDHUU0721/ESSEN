import { Request, Response, NextFunction } from 'express';
import { RestaurantTable } from '../models/RestaurantTable';
import { TableBooking } from '../models/TableBooking';
import { Waitlist } from '../models/Waitlist';
import { Restaurant } from '../models/Restaurant';
import { AuthRequest } from '../middleware/auth';
import { generateBookingReference, generateQRCodeDataURL, generateSecureToken } from '../utils/qr';
import { emitToRestaurant } from '../config/socket';

export class DineInController {
  /**
   * Get Tables for Restaurant
   */
  public static async getTables(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const tables = await RestaurantTable.find({ restaurant: restaurantId }).sort({ tableNumber: 1 });

      res.status(200).json({
        success: true,
        data: { tables },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate Table QR Code
   */
  public static async generateTableQR(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tableId } = req.params;
      const table = await RestaurantTable.findById(tableId).populate('restaurant', 'name restaurantCode');
      if (!table) {
        res.status(404).json({ success: false, error: { code: 'TABLE_NOT_FOUND', message: 'Table not found' } });
        return;
      }

      // Generate a structured payload for the table QR
      const qrPayload = JSON.stringify({
        restaurantId: table.restaurant._id,
        tableId: table._id,
        tableNumber: table.tableNumber,
        qrToken: table.qrToken,
      });

      const qrDataUrl = await generateQRCodeDataURL(qrPayload);

      res.status(200).json({
        success: true,
        data: {
          tableNumber: table.tableNumber,
          tableName: table.tableName,
          restaurantName: (table.restaurant as any).name,
          qrToken: table.qrToken,
          qrCodeImage: qrDataUrl,
          qrPayload,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Scanned Table QR Code (Never trust client restaurant/table IDs directly)
   */
  public static async verifyTableQR(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { qrToken } = req.body;
      if (!qrToken) {
        res.status(400).json({ success: false, error: { code: 'MISSING_QR_TOKEN', message: 'QR token is required.' } });
        return;
      }

      const table = await RestaurantTable.findOne({ qrToken }).populate('restaurant', 'name images status address services');
      if (!table) {
        res.status(404).json({
          success: false,
          error: { code: 'INVALID_TABLE_QR', message: 'Invalid or expired Table QR code.' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Table QR verified successfully.',
        data: {
          table: {
            id: table._id,
            tableNumber: table.tableNumber,
            tableName: table.tableName,
            capacity: table.capacity,
            status: table.status,
          },
          restaurant: table.restaurant,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Book a Table
   */
  public static async bookTable(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { partySize, bookingDate, timeSlot, specialRequests, customerName, customerPhone, customerEmail } = req.body;

      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Restaurant not found' } });
        return;
      }

      const bookingRef = generateBookingReference();

      const booking = await TableBooking.create({
        bookingReference: bookingRef,
        customer: req.userId || (req.user?._id as any),
        restaurant: restaurantId,
        customerName: customerName || req.user?.name || 'Guest Customer',
        customerPhone: customerPhone || req.user?.phone || '9876543210',
        customerEmail: customerEmail || req.user?.email || 'guest@essen.com',
        partySize: partySize || 2,
        bookingDate,
        timeSlot,
        specialRequests: specialRequests || '',
        status: 'CONFIRMED',
      });

      emitToRestaurant(restaurantId, 'new_table_booking', { booking });

      res.status(201).json({
        success: true,
        message: 'Table booked successfully! Confirmation sent.',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Customer's Bookings
   */
  public static async getMyBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await TableBooking.find({ customer: req.userId })
        .populate('restaurant', 'name images address rating')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { bookings },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Join Restaurant Waitlist
   */
  public static async joinWaitlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { partySize, customerName, customerPhone } = req.body;

      const currentWaitingCount = await Waitlist.countDocuments({ restaurant: restaurantId, status: 'WAITING' });
      const queuePosition = currentWaitingCount + 1;
      const estimatedWaitMinutes = queuePosition * 12;

      const waitlistEntry = await Waitlist.create({
        customer: req.userId || (req.user?._id as any),
        restaurant: restaurantId,
        customerName: customerName || req.user?.name || 'Guest',
        customerPhone: customerPhone || req.user?.phone || '9876543210',
        partySize: partySize || 2,
        queuePosition,
        estimatedWaitMinutes,
        status: 'WAITING',
      });

      emitToRestaurant(restaurantId, 'new_waitlist_entry', { waitlistEntry });

      res.status(201).json({
        success: true,
        message: `You have joined the waitlist at position #${queuePosition}.`,
        data: { waitlist: waitlistEntry },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Customer Live In-Restaurant Waiter Assistance Request
   */
  public static async requestWaiterAssistance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId, tableNumber, requestType, note } = req.body;

      // requestType: 'call_waiter' | 'request_water' | 'request_cutlery' | 'request_bill' | 'other'
      emitToRestaurant(restaurantId, 'waiter_customer_request', {
        tableNumber,
        requestType,
        note: note || '',
        timestamp: new Date(),
      });

      if (requestType === 'request_bill') {
        await RestaurantTable.findOneAndUpdate({ restaurant: restaurantId, tableNumber }, { status: 'BILL_REQUESTED' });
      }

      res.status(200).json({
        success: true,
        message: `Waiter has been notified for Table ${tableNumber}.`,
      });
    } catch (error) {
      next(error);
    }
  }
}
