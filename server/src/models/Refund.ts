import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRefund extends Document {
  refundNumber: string;
  order: mongoose.Types.ObjectId;
  orderNumber: string;
  payment: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PROCESSED' | 'REJECTED';
  processedBy?: mongoose.Types.ObjectId;
  adminNote?: string;
  transactionReference?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema = new Schema<IRefund>(
  {
    refundNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    orderNumber: { type: String, required: true },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'PROCESSED', 'REJECTED'],
      default: 'REQUESTED',
      index: true,
    },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    adminNote: { type: String },
    transactionReference: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export const Refund: Model<IRefund> =
  mongoose.models.Refund || mongoose.model<IRefund>('Refund', RefundSchema);
