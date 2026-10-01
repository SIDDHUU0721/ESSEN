import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRestaurantTable extends Document {
  restaurant: mongoose.Types.ObjectId;
  tableNumber: number;
  tableName: string; // e.g. "Table 4 - Window Side"
  capacity: number;
  section: 'indoor' | 'outdoor' | 'rooftop' | 'private_dining';
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILL_REQUESTED' | 'CLEANING';
  currentOrderId?: mongoose.Types.ObjectId;
  assignedWaiter?: mongoose.Types.ObjectId;
  qrToken: string; // Cryptographic QR token for secure dine-in validation
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantTableSchema = new Schema<IRestaurantTable>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    tableNumber: { type: Number, required: true },
    tableName: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    section: {
      type: String,
      enum: ['indoor', 'outdoor', 'rooftop', 'private_dining'],
      default: 'indoor',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'BILL_REQUESTED', 'CLEANING'],
      default: 'AVAILABLE',
      index: true,
    },
    currentOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    assignedWaiter: { type: Schema.Types.ObjectId, ref: 'User' },
    qrToken: { type: String, required: true },
  },
  { timestamps: true }
);

RestaurantTableSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true });

export const RestaurantTable: Model<IRestaurantTable> =
  mongoose.models.RestaurantTable || mongoose.model<IRestaurantTable>('RestaurantTable', RestaurantTableSchema);
