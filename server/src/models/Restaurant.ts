import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  restaurantCode: string; // Unique hotel/restaurant code
  description: string;
  tagline: string;
  cuisine: string[];
  foodType: 'veg' | 'non-veg' | 'both' | 'pure-veg';
  ambience: string[];
  restaurantType: 'family' | 'cafe' | 'fast_food' | 'fine_dining' | 'cloud_kitchen';
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  businessInfo: {
    gstin?: string;
    fssaiLicense?: string;
    panNumber?: string;
  };
  images: {
    cover: string;
    logo: string;
    gallery: string[];
  };
  openingHours: {
    openTime: string; // e.g. "10:00"
    closeTime: string; // e.g. "23:00"
    daysOpen: string[];
  };
  status: 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'TEMPORARILY_UNAVAILABLE';
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  isVerified: boolean;
  services: {
    dineIn: boolean;
    delivery: boolean;
    takeaway: boolean;
    tableBooking: boolean;
  };
  averagePriceForTwo: number;
  rating: number;
  reviewCount: number;
  rewardsSettings: {
    isEnabled: boolean;
    coinsPerOrderMin: number; // e.g. 5
    coinsPerOrderMax: number; // e.g. 10
    targetCoins: number; // Baseline 5000 coins
    rewardTitle: string; // "Free Special Combo"
    rewardDescription: string;
    comboItems: string[];
  };
  cancellationPolicy: {
    allowBeforeAcceptance: boolean;
    allowDuringPreparation: boolean;
    cancellationFeePercentage: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    restaurantCode: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, required: true },
    tagline: { type: String, default: '' },
    cuisine: [{ type: String, index: true }],
    foodType: { type: String, enum: ['veg', 'non-veg', 'both', 'pure-veg'], default: 'both', index: true },
    ambience: [{ type: String }],
    restaurantType: {
      type: String,
      enum: ['family', 'cafe', 'fast_food', 'fine_dining', 'cloud_kitchen'],
      default: 'family',
      index: true,
    },
    address: {
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      website: { type: String },
    },
    businessInfo: {
      gstin: { type: String },
      fssaiLicense: { type: String },
      panNumber: { type: String },
    },
    images: {
      cover: { type: String, required: true },
      logo: { type: String, required: true },
      gallery: [{ type: String }],
    },
    openingHours: {
      openTime: { type: String, default: '10:00' },
      closeTime: { type: String, default: '23:00' },
      daysOpen: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSING_SOON', 'CLOSED', 'TEMPORARILY_UNAVAILABLE'],
      default: 'OPEN',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
      default: 'VERIFIED',
      index: true,
    },
    isVerified: { type: Boolean, default: true, index: true },
    services: {
      dineIn: { type: Boolean, default: true },
      delivery: { type: Boolean, default: true },
      takeaway: { type: Boolean, default: true },
      tableBooking: { type: Boolean, default: true },
    },
    averagePriceForTwo: { type: Number, default: 400, index: true },
    rating: { type: Number, default: 4.5, min: 1, max: 5, index: true },
    reviewCount: { type: Number, default: 0 },
    rewardsSettings: {
      isEnabled: { type: Boolean, default: true },
      coinsPerOrderMin: { type: Number, default: 5 },
      coinsPerOrderMax: { type: Number, default: 10 },
      targetCoins: { type: Number, default: 5000 },
      rewardTitle: { type: String, default: 'Free Royal Chef Special Combo' },
      rewardDescription: { type: String, default: 'Enjoy a gourmet multi-course combo meal on the house upon reaching 5,000 ESSEN Coins.' },
      comboItems: [{ type: String }],
    },
    cancellationPolicy: {
      allowBeforeAcceptance: { type: Boolean, default: true },
      allowDuringPreparation: { type: Boolean, default: false },
      cancellationFeePercentage: { type: Number, default: 20 },
    },
  },
  { timestamps: true }
);

// Geospatial 2dsphere index for location search
RestaurantSchema.index({ location: '2dsphere' });
// Compound indexes for high performance filtering
RestaurantSchema.index({ status: 1, isVerified: 1, rating: -1 });
RestaurantSchema.index({ 'address.city': 1, cuisine: 1 });

export const Restaurant: Model<IRestaurant> =
  mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
