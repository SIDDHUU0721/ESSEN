import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRestaurantStaff extends Document {
  user: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  staffRole: 'waiter' | 'manager' | 'chef' | 'host';
  employeeCode: string;
  assignedTables: number[]; // Table numbers assigned to this waiter
  isActive: boolean;
  invitedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantStaffSchema = new Schema<IRestaurantStaff>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    staffRole: {
      type: String,
      enum: ['waiter', 'manager', 'chef', 'host'],
      default: 'waiter',
      index: true,
    },
    employeeCode: { type: String, required: true, uppercase: true, trim: true },
    assignedTables: [{ type: Number }],
    isActive: { type: Boolean, default: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

RestaurantStaffSchema.index({ user: 1, restaurant: 1 }, { unique: true });

export const RestaurantStaff: Model<IRestaurantStaff> =
  mongoose.models.RestaurantStaff || mongoose.model<IRestaurantStaff>('RestaurantStaff', RestaurantStaffSchema);
