import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRewardTransaction extends Document {
  rewardAccount: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  orderNumber?: string;
  type: 'EARNED_VOUCHER' | 'REDEEMED_COMBO' | 'BONUS_CAMPAIGN' | 'REFUND_REVERSAL' | 'EXPIRED';
  coins: number; // positive for earn, negative for redeem
  balanceAfter: number;
  description: string;
  voucherId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RewardTransactionSchema = new Schema<IRewardTransaction>(
  {
    rewardAccount: { type: Schema.Types.ObjectId, ref: 'RewardAccount', required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    orderNumber: { type: String },
    type: {
      type: String,
      enum: ['EARNED_VOUCHER', 'REDEEMED_COMBO', 'BONUS_CAMPAIGN', 'REFUND_REVERSAL', 'EXPIRED'],
      required: true,
      index: true,
    },
    coins: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    voucherId: { type: Schema.Types.ObjectId, ref: 'RewardVoucher' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

RewardTransactionSchema.index({ customer: 1, createdAt: -1 });

export const RewardTransaction: Model<IRewardTransaction> =
  mongoose.models.RewardTransaction || mongoose.model<IRewardTransaction>('RewardTransaction', RewardTransactionSchema);
