import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 20 for 20% or 100 for ₹100
  minOrderValue: number;
  maxDiscountAmount: number;
  restaurant?: mongoose.Types.ObjectId; // null for platform-wide coupon
  applicableOrderTypes: Array<'dine_in' | 'online' | 'takeaway'>;
  startDate: Date;
  expiryDate: Date;
  usageLimitPerUser: number;
  totalUsageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 1 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: 500 },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', index: true },
    applicableOrderTypes: [{ type: String, enum: ['dine_in', 'online', 'takeaway'], default: ['online', 'dine_in'] }],
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true, index: true },
    usageLimitPerUser: { type: Number, default: 1 },
    totalUsageLimit: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
