import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITableBooking extends Document {
  bookingReference: string;
  customer: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  table?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  partySize: number;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "19:30"
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  specialRequests?: string;
  cancellationReason?: string;
  checkedInAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TableBookingSchema = new Schema<ITableBooking>(
  {
    bookingReference: { type: String, required: true, unique: true, uppercase: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    table: { type: Schema.Types.ObjectId, ref: 'RestaurantTable' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    partySize: { type: Number, required: true, min: 1 },
    bookingDate: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      default: 'CONFIRMED',
      index: true,
    },
    specialRequests: { type: String, default: '' },
    cancellationReason: { type: String },
    checkedInAt: { type: Date },
  },
  { timestamps: true }
);

TableBookingSchema.index({ restaurant: 1, bookingDate: 1, timeSlot: 1 });

export const TableBooking: Model<ITableBooking> =
  mongoose.models.TableBooking || mongoose.model<ITableBooking>('TableBooking', TableBookingSchema);
