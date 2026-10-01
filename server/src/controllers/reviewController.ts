import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { Restaurant } from '../models/Restaurant';
import { AuthRequest } from '../middleware/auth';

export class ReviewController {
  /**
   * Submit Review for a Completed Order
   */
  public static async submitReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, rating, foodRating, deliveryRating, comment, itemRatings } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
        return;
      }

      // Check if order is eligible
      if (order.status !== 'COMPLETED' && order.status !== 'DELIVERED') {
        res.status(400).json({
          success: false,
          error: { code: 'ORDER_NOT_COMPLETED', message: 'Reviews can only be submitted for completed orders.' },
        });
        return;
      }

      // Automated sentiment classification
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      if (rating >= 4) sentiment = 'positive';
      else if (rating <= 2) sentiment = 'negative';

      const review = await Review.create({
        order: order._id,
        customer: req.userId,
        customerName: req.user?.name || 'Customer',
        customerAvatar: req.user?.avatar,
        restaurant: order.restaurant,
        rating,
        foodRating,
        deliveryRating,
        comment,
        sentiment,
        itemRatings,
      });

      // Recalculate restaurant overall rating
      const allReviews = await Review.find({ restaurant: order.restaurant });
      const avgRating = Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1));
      await Restaurant.findByIdAndUpdate(order.restaurant, {
        rating: avgRating,
        reviewCount: allReviews.length,
      });

      res.status(201).json({
        success: true,
        message: 'Thank you for your valuable feedback!',
        data: { review },
      });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          error: { code: 'REVIEW_ALREADY_EXISTS', message: 'You have already submitted a review for this order.' },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Manager Reply to Customer Review
   */
  public static async replyToReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { message } = req.body;

      const review = await Review.findById(id);
      if (!review) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found' } });
        return;
      }

      review.restaurantReply = {
        message,
        repliedAt: new Date(),
        repliedBy: req.userId as any,
      };
      await review.save();

      res.status(200).json({
        success: true,
        message: 'Reply posted.',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }
}
