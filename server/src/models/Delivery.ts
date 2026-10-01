import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDelivery extends Document {
  order: mongoose.Types.ObjectId;
  orderNumber: string;
  restaurant: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  deliveryPartner?: mongoose.Types.ObjectId;
  status: 'PENDING_ASSIGNMENT' | 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'ARRIVED' | 'DELIVERED' | 'FAILED';
  deliveryOtp: string; // 4-digit code verified server-side
  pickupAddress: {
    name: string;
    street: string;
    city: string;
    coordinates?: [number, number];
  };
  deliveryAddress: {
    name: string;
    street: string;
    city: string;
    phone: string;
    coordinates?: [number, number];
  };
  currentLocation: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
  estimatedMinutesRemaining: number;
  timeline: Array<{
    status: string;
    timestamp: Date;
    note?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
    orderNumber: { type: String, required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deliveryPartner: { type: Schema.Types.ObjectId, ref: 'DeliveryPartner', index: true },
    status: {
      type: String,
      enum: ['PENDING_ASSIGNMENT', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'ARRIVED', 'DELIVERED', 'FAILED'],
      default: 'PENDING_ASSIGNMENT',
      index: true,
    },
    deliveryOtp: { type: String, required: true },
    pickupAddress: {
      name: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: [{ type: Number }],
    },
    deliveryAddress: {
      name: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
      coordinates: [{ type: Number }],
    },
    currentLocation: {
      lat: { type: Number, default: 13.0827 },
      lng: { type: Number, default: 80.2707 },
      updatedAt: { type: Date, default: Date.now },
    },
    estimatedMinutesRemaining: { type: Number, default: 25 },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Delivery: Model<IDelivery> =
  mongoose.models.Delivery || mongoose.model<IDelivery>('Delivery', DeliverySchema);
