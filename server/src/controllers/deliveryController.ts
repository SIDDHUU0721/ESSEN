import { Request, Response, NextFunction } from 'express';
import { Delivery } from '../models/Delivery';
import { Order } from '../models/Order';
import { DeliveryPartner } from '../models/DeliveryPartner';
import { AuthRequest } from '../middleware/auth';
import { emitToOrder, emitToRestaurant, emitToUser } from '../config/socket';

export class DeliveryController {
  /**
   * Get Live Delivery by Order ID
   */
  public static async getDeliveryByOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const delivery = await Delivery.findOne({ order: orderId })
        .populate('restaurant', 'name address location contact')
        .populate('deliveryPartner');

      if (!delivery) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Delivery record not found' } });
        return;
      }

      res.status(200).json({
        success: true,
        data: { delivery },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Driver Location Update & Live GPS Simulation
   */
  public static async updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { lat, lng, estimatedMinutesRemaining } = req.body;

      const delivery = await Delivery.findById(id);
      if (!delivery) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Delivery not found' } });
        return;
      }

      delivery.currentLocation = {
        lat,
        lng,
        updatedAt: new Date(),
      };
      if (estimatedMinutesRemaining !== undefined) {
        delivery.estimatedMinutesRemaining = estimatedMinutesRemaining;
      }

      await delivery.save();

      // Emit live coordinates over Socket.IO
      emitToOrder(delivery.order.toString(), 'delivery_location_update', {
        deliveryId: delivery._id,
        orderId: delivery.order,
        lat,
        lng,
        estimatedMinutesRemaining: delivery.estimatedMinutesRemaining,
      });

      res.status(200).json({
        success: true,
        data: { delivery },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delivery Partner Accepts & Picks Up Order
   */
  public static async pickupOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const delivery = await Delivery.findById(id);
      if (!delivery) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Delivery not found' } });
        return;
      }

      delivery.status = 'OUT_FOR_DELIVERY';
      delivery.timeline.push({
        status: 'Picked Up & Out for Delivery',
        timestamp: new Date(),
        note: 'Driver has picked up package and is en route',
      });
      await delivery.save();

      await Order.findByIdAndUpdate(delivery.order, {
        status: 'OUT_FOR_DELIVERY',
        $push: { statusHistory: { status: 'OUT_FOR_DELIVERY', changedAt: new Date(), note: 'Out for delivery' } },
      });

      emitToOrder(delivery.order.toString(), 'order_status_update', { orderId: delivery.order, status: 'OUT_FOR_DELIVERY' });

      res.status(200).json({
        success: true,
        message: 'Order picked up and marked out for delivery.',
        data: { delivery },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Server-Side Delivery OTP
   */
  public static async verifyDeliveryOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { otp } = req.body;

      const delivery = await Delivery.findById(id);
      if (!delivery) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Delivery not found' } });
        return;
      }

      if (delivery.deliveryOtp !== otp) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_OTP', message: 'Invalid delivery OTP entered. Please verify with customer.' },
        });
        return;
      }

      delivery.status = 'DELIVERED';
      delivery.estimatedMinutesRemaining = 0;
      delivery.timeline.push({
        status: 'Delivered',
        timestamp: new Date(),
        note: 'Customer provided matching OTP. Order successfully completed.',
      });
      await delivery.save();

      await Order.findByIdAndUpdate(delivery.order, {
        status: 'DELIVERED',
        $push: { statusHistory: { status: 'DELIVERED', changedAt: new Date(), note: 'Delivered via OTP confirmation' } },
      });

      emitToOrder(delivery.order.toString(), 'order_status_update', { orderId: delivery.order, status: 'DELIVERED' });
      emitToUser(delivery.customer.toString(), 'order_delivered', { orderId: delivery.order });

      res.status(200).json({
        success: true,
        message: 'Delivery confirmed successfully! Order marked as DELIVERED.',
        data: { delivery },
      });
    } catch (error) {
      next(error);
    }
  }
}
