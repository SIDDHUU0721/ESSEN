import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDeliveryPartner extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  vehicleType: 'bike' | 'scooter' | 'electric_cycle' | 'car';
  vehicleNumber: string;
  licenseNumber: string;
  isAvailable: boolean;
  currentLocation: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  activeOrderId?: mongoose.Types.ObjectId;
  rating: number;
  totalDeliveries: number;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryPartnerSchema = new Schema<IDeliveryPartner>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleType: { type: String, enum: ['bike', 'scooter', 'electric_cycle', 'car'], default: 'bike' },
    vehicleNumber: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    isAvailable: { type: Boolean, default: true, index: true },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [80.2707, 13.0827],
      },
    },
    activeOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, default: 4.8 },
    totalDeliveries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DeliveryPartnerSchema.index({ currentLocation: '2dsphere' });

export const DeliveryPartner: Model<IDeliveryPartner> =
  mongoose.models.DeliveryPartner || mongoose.model<IDeliveryPartner>('DeliveryPartner', DeliveryPartnerSchema);
