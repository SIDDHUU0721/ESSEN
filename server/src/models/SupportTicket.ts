import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupportMessage {
  sender: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: 'customer' | 'manager' | 'admin' | 'system';
  message: string;
  attachments?: string[];
  timestamp: Date;
}

export interface ISupportTicket extends Document {
  ticketNumber: string; // e.g. "TCK-8821"
  customer: mongoose.Types.ObjectId;
  restaurant?: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  category: 'Order Problem' | 'Payment Problem' | 'Delivery Problem' | 'Restaurant Problem' | 'Refund Problem' | 'Reward Problem' | 'Other';
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  messages: ISupportMessage[];
  resolutionNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
    category: {
      type: String,
      enum: [
        'Order Problem',
        'Payment Problem',
        'Delivery Problem',
        'Restaurant Problem',
        'Refund Problem',
        'Reward Problem',
        'Other',
      ],
      required: true,
      index: true,
    },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    messages: [
      {
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderName: { type: String, required: true },
        senderRole: { type: String, enum: ['customer', 'manager', 'admin', 'system'], required: true },
        message: { type: String, required: true },
        attachments: [{ type: String }],
        timestamp: { type: Date, default: Date.now },
      },
    ],
    resolutionNotes: { type: String },
    resolvedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

SupportTicketSchema.index({ customer: 1, status: 1 });

export const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
