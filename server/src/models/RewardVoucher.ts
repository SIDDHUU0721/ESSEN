import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRewardVoucher extends Document {
  voucherCode: string; // e.g. "VOUCH-83921-9X8"
  qrToken: string; // Signed / cryptographic hash for QR scanning
  order: mongoose.Types.ObjectId;
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  coinAmount: number; // 5 to 10 coins calculated at order completion
  status: 'UNCLAIMED' | 'CLAIMED' | 'EXPIRED' | 'INVALIDATED';
  expiresAt: Date; // e.g. 7 days to claim QR voucher
  claimedAt?: Date;
  invalidatedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RewardVoucherSchema = new Schema<IRewardVoucher>(
  {
    voucherCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    qrToken: { type: String, required: true, unique: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
    orderNumber: { type: String, required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    coinAmount: { type: Number, required: true, min: 5, max: 10 },
    status: {
      type: String,
      enum: ['UNCLAIMED', 'CLAIMED', 'EXPIRED', 'INVALIDATED'],
      default: 'UNCLAIMED',
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    claimedAt: { type: Date },
    invalidatedReason: { type: String },
  },
  { timestamps: true }
);

RewardVoucherSchema.index({ customer: 1, status: 1 });

export const RewardVoucher: Model<IRewardVoucher> =
  mongoose.models.RewardVoucher || mongoose.model<IRewardVoucher>('RewardVoucher', RewardVoucherSchema);
