import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models/Coupon';

export class CouponController {
  public static async getAvailableCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupons = await Coupon.find({ isActive: true, expiryDate: { $gte: new Date() } });
      res.status(200).json({
        success: true,
        data: { coupons },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, orderTotal, restaurantId } = req.body;
      const coupon = await Coupon.findOne({
        code: code.toUpperCase().trim(),
        isActive: true,
        expiryDate: { $gte: new Date() },
      });

      if (!coupon) {
        res.status(404).json({
          success: false,
          error: { code: 'INVALID_COUPON', message: 'Coupon code is invalid or has expired.' },
        });
        return;
      }

      if (orderTotal < coupon.minOrderValue) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MIN_ORDER_NOT_MET',
            message: `Coupon requires a minimum order value of ₹${coupon.minOrderValue}. Current order: ₹${orderTotal}`,
          },
        });
        return;
      }

      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = Math.min((orderTotal * coupon.discountValue) / 100, coupon.maxDiscountAmount);
      } else {
        discountAmount = Math.min(coupon.discountValue, orderTotal);
      }

      res.status(200).json({
        success: true,
        message: 'Coupon applied successfully!',
        data: {
          code: coupon.code,
          discountAmount: Number(discountAmount.toFixed(2)),
          finalTotal: Number((orderTotal - discountAmount).toFixed(2)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
