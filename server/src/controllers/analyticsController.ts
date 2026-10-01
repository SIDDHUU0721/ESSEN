import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { RewardAccount } from '../models/RewardAccount';
import { MenuItem } from '../models/MenuItem';

export class AnalyticsController {
  /**
   * Manager Performance & Revenue Analytics Dashboard
   */
  public static async getManagerDashboardAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const filter = restaurantId ? { restaurant: restaurantId } : {};

      const orders = await Order.find(filter);
      const reviews = await Review.find(filter);
      const rewardAccounts = await RewardAccount.find(filter);

      const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
      const totalRevenue = paidOrders.reduce((sum, o) => sum + o.pricing.grandTotal, 0);

      const dineInOrders = orders.filter((o) => o.orderType === 'dine_in').length;
      const onlineOrders = orders.filter((o) => o.orderType === 'online').length;
      const takeawayOrders = orders.filter((o) => o.orderType === 'takeaway').length;

      const completedOrders = orders.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;
      const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED').length;

      const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

      // Hourly peak breakdown
      const hourlyDistribution = Array(24).fill(0);
      orders.forEach((o) => {
        const hour = new Date(o.createdAt).getHours();
        hourlyDistribution[hour] += 1;
      });

      // Top foods
      const topDishes = await MenuItem.find(filter).sort({ orderCount: -1 }).limit(5);

      // Sentiment distribution
      const sentimentCounts = {
        positive: reviews.filter((r) => r.sentiment === 'positive').length,
        neutral: reviews.filter((r) => r.sentiment === 'neutral').length,
        negative: reviews.filter((r) => r.sentiment === 'negative').length,
      };

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalRevenue,
            totalOrders: orders.length,
            completedOrders,
            cancelledOrders,
            dineInOrders,
            onlineOrders,
            takeawayOrders,
            avgOrderValue,
            activeLoyaltyMembers: rewardAccounts.length,
            totalReviews: reviews.length,
          },
          hourlyDistribution,
          topDishes,
          sentimentCounts,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
