import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRewardRedemption extends Document {
  redemptionCode: string; // e.g. "RDM-COMBO-7729"
  qrToken: string;
  customer: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  rewardTitle: string;
  comboItems: string[];
  coinsCost: number; // typically 5000 coins
  status: 'ACTIVE' | 'SCANNED_REDEEMED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: Date; // e.g. 30 days
  scannedAt?: Date;
  scannedByStaff?: mongoose.Types.ObjectId;
  scannedByStaffName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RewardRedemptionSchema = new Schema<IRewardRedemption>(
  {
    redemptionCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    qrToken: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    rewardTitle: { type: String, required: true },
    comboItems: [{ type: String }],
    coinsCost: { type: Number, required: true, default: 5000 },
    status: {
      type: String,
      enum: ['ACTIVE', 'SCANNED_REDEEMED', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    scannedAt: { type: Date },
    scannedByStaff: { type: Schema.Types.ObjectId, ref: 'User' },
    scannedByStaffName: { type: String },
  },
  { timestamps: true }
);

RewardRedemptionSchema.index({ customer: 1, status: 1 });
RewardRedemptionSchema.index({ restaurant: 1, status: 1 });

export const RewardRedemption: Model<IRewardRedemption> =
  mongoose.models.RewardRedemption || mongoose.model<IRewardRedemption>('RewardRedemption', RewardRedemptionSchema);
