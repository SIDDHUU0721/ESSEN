import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'customer' | 'waiter' | 'manager' | 'admin' | 'delivery_partner';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  addresses: Array<{
    id: string;
    title: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
  preferences?: {
    foodType?: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'egg' | 'any';
    favoriteCuisines?: string[];
    spicinessPreference?: 'mild' | 'medium' | 'spicy';
  };
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'waiter', 'manager', 'admin', 'delivery_partner'],
      default: 'customer',
      index: true,
    },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    addresses: [
      {
        id: { type: String, required: true },
        title: { type: String, default: 'Home' },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    preferences: {
      foodType: { type: String, enum: ['vegetarian', 'non-vegetarian', 'vegan', 'egg', 'any'], default: 'any' },
      favoriteCuisines: [{ type: String }],
      spicinessPreference: { type: String, enum: ['mild', 'medium', 'spicy'], default: 'medium' },
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
