import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWaitlist extends Document {
  customer: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  partySize: number;
  queuePosition: number;
  estimatedWaitMinutes: number;
  status: 'WAITING' | 'TABLE_READY' | 'SEATED' | 'CANCELLED' | 'EXPIRED';
  notifiedAt?: Date;
  seatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WaitlistSchema = new Schema<IWaitlist>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    partySize: { type: Number, required: true, min: 1 },
    queuePosition: { type: Number, required: true, default: 1 },
    estimatedWaitMinutes: { type: Number, default: 15 },
    status: {
      type: String,
      enum: ['WAITING', 'TABLE_READY', 'SEATED', 'CANCELLED', 'EXPIRED'],
      default: 'WAITING',
      index: true,
    },
    notifiedAt: { type: Date },
    seatedAt: { type: Date },
  },
  { timestamps: true }
);

WaitlistSchema.index({ restaurant: 1, status: 1, createdAt: 1 });

export const Waitlist: Model<IWaitlist> =
  mongoose.models.Waitlist || mongoose.model<IWaitlist>('Waitlist', WaitlistSchema);
