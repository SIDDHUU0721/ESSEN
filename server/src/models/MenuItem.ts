import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomizationOption {
  name: string;
  price: number;
}

export interface ICustomizationGroup {
  name: string; // e.g. "Portion Size", "Spice Level", "Add-ons"
  type: 'single' | 'multiple';
  isRequired: boolean;
  options: ICustomizationOption[];
}

export interface IMenuItem extends Document {
  restaurant: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  foodType: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'egg';
  tasteProfile: 'spicy' | 'sweet' | 'mild' | 'tangy' | 'healthy' | 'savory';
  cuisine: string;
  image: string;
  isAvailable: boolean;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'TEMPORARILY_UNAVAILABLE';
  isTrending: boolean;
  isBestseller: boolean;
  rating: number;
  orderCount: number;
  preparationTimeMinutes: number;
  nutritionalInfo?: {
    calories?: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatGrams?: number;
  };
  customizationGroups: ICustomizationGroup[];
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0, index: true },
    foodType: {
      type: String,
      enum: ['vegetarian', 'non-vegetarian', 'vegan', 'egg'],
      required: true,
      index: true,
    },
    tasteProfile: {
      type: String,
      enum: ['spicy', 'sweet', 'mild', 'tangy', 'healthy', 'savory'],
      default: 'savory',
      index: true,
    },
    cuisine: { type: String, required: true, index: true },
    image: { type: String, required: true },
    isAvailable: { type: Boolean, default: true, index: true },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OUT_OF_STOCK', 'TEMPORARILY_UNAVAILABLE'],
      default: 'AVAILABLE',
      index: true,
    },
    isTrending: { type: Boolean, default: false, index: true },
    isBestseller: { type: Boolean, default: false, index: true },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    orderCount: { type: Number, default: 0, index: true },
    preparationTimeMinutes: { type: Number, default: 20 },
    nutritionalInfo: {
      calories: { type: Number },
      proteinGrams: { type: Number },
      carbsGrams: { type: Number },
      fatGrams: { type: Number },
    },
    customizationGroups: [
      {
        name: { type: String, required: true },
        type: { type: String, enum: ['single', 'multiple'], default: 'single' },
        isRequired: { type: Boolean, default: false },
        options: [
          {
            name: { type: String, required: true },
            price: { type: Number, default: 0 },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Compound text index for food search
MenuItemSchema.index({ name: 'text', description: 'text', cuisine: 'text' });
MenuItemSchema.index({ restaurant: 1, foodType: 1, price: 1 });
MenuItemSchema.index({ restaurant: 1, category: 1, status: 1 });

export const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
