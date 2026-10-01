import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRewardAccount extends Document {
  customer: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  coinBalance: number; // Restaurant-specific coin balance
  lifetimeCoinsEarned: number;
  lifetimeCoinsRedeemed: number;
  unlockedCombosCount: number;
  lastOrderDate?: Date;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  createdAt: Date;
  updatedAt: Date;
}

const RewardAccountSchema = new Schema<IRewardAccount>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    coinBalance: { type: Number, default: 0, min: 0 },
    lifetimeCoinsEarned: { type: Number, default: 0 },
    lifetimeCoinsRedeemed: { type: Number, default: 0 },
    unlockedCombosCount: { type: Number, default: 0 },
    lastOrderDate: { type: Date },
    tier: {
      type: String,
      enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'],
      default: 'BRONZE',
    },
  },
  { timestamps: true }
);

// Unique composite index for customer-restaurant pair
RewardAccountSchema.index({ customer: 1, restaurant: 1 }, { unique: true });
RewardAccountSchema.index({ restaurant: 1, coinBalance: -1 });

export const RewardAccount: Model<IRewardAccount> =
  mongoose.models.RewardAccount || mongoose.model<IRewardAccount>('RewardAccount', RewardAccountSchema);
