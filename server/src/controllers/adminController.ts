import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Restaurant } from '../models/Restaurant';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Refund } from '../models/Refund';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import { mockStore } from '../utils/mockDataStore';

export class AdminController {
  /**
   * Platform Overview Metrics
   */
  public static async getPlatformMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        res.status(200).json({
          success: true,
          data: {
            restaurantsCount: mockStore.restaurants.length,
            usersCount: Object.keys(mockStore.users).length,
            ordersCount: mockStore.orders.length || 3820,
            pendingRefundsCount: 1,
            platformGrossVolume: 892400,
          },
        });
        return;
      }

      const [restaurantsCount, usersCount, ordersCount, refunds] = await Promise.all([
        Restaurant.countDocuments(),
        User.countDocuments(),
        Order.countDocuments(),
        Refund.find({ status: 'REQUESTED' }),
      ]);

      const paidOrders = await Order.find({ paymentStatus: 'PAID' });
      const platformGrossVolume = paidOrders.reduce((s, o) => s + o.pricing.grandTotal, 0);

      res.status(200).json({
        success: true,
        data: {
          restaurantsCount,
          usersCount,
          ordersCount,
          pendingRefundsCount: refunds.length,
          platformGrossVolume,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve / Verify Restaurant
   */
  public static async updateRestaurantVerification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { verificationStatus } = req.body; // 'VERIFIED' | 'REJECTED' | 'SUSPENDED'

      const restaurant = await Restaurant.findByIdAndUpdate(
        id,
        {
          verificationStatus,
          isVerified: verificationStatus === 'VERIFIED',
        },
        { new: true }
      );

      if (!restaurant) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Restaurant not found' } });
        return;
      }

      await AuditLog.create({
        actor: req.userId,
        actorRole: 'admin',
        actorName: req.user?.name || 'Platform Admin',
        action: `RESTAURANT_VERIFICATION_${verificationStatus}`,
        entity: 'Restaurant',
        entityId: restaurant._id.toString(),
        restaurant: restaurant._id,
        details: { verificationStatus },
      });

      res.status(200).json({
        success: true,
        message: `Restaurant verification status set to ${verificationStatus}.`,
        data: { restaurant },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Audit Logs
   */
  public static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50);
      res.status(200).json({
        success: true,
        data: { logs },
      });
    } catch (error) {
      next(error);
    }
  }
}
