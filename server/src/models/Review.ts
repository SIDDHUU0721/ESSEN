import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  order: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  customerName: string;
  customerAvatar?: string;
  restaurant: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  foodRating?: number;
  deliveryRating?: number;
  comment: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  itemRatings?: Array<{
    menuItemId: mongoose.Types.ObjectId;
    itemName: string;
    rating: number;
  }>;
  restaurantReply?: {
    message: string;
    repliedAt: Date;
    repliedBy: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerName: { type: String, required: true },
    customerAvatar: { type: String },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    foodRating: { type: Number, min: 1, max: 5 },
    deliveryRating: { type: Number, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'positive',
      index: true,
    },
    itemRatings: [
      {
        menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
        itemName: { type: String },
        rating: { type: Number },
      },
    ],
    restaurantReply: {
      message: { type: String },
      repliedAt: { type: Date },
      repliedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ restaurant: 1, rating: -1 });

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
