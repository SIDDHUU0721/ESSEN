import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderType = 'dine_in' | 'online' | 'takeaway';

export type OrderStatus =
  | 'PLACED'
  | 'NEW'
  | 'PAYMENT_SUCCESS'
  | 'RESTAURANT_ACCEPTED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface IOrderItemSnapshot {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 5%
  taxAmount: number;
  customizations: Array<{
    groupName: string;
    optionName: string;
    price: number;
  }>;
  specialInstructions?: string;
  itemTotal: number;
}

export interface IOrderPricingSnapshot {
  itemTotal: number;
  discountAmount: number;
  couponCode?: string;
  taxableAmount: number;
  applicableTaxes: number; // GST (CGST + SGST)
  serviceCharge: number;
  deliveryFee: number;
  packagingFee: number;
  tipAmount: number;
  grandTotal: number;
}

export interface IOrder extends Document {
  orderNumber: string; // e.g. "ORD-83921"
  customer: mongoose.Types.ObjectId;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
  };
  restaurant: mongoose.Types.ObjectId;
  restaurantDetails: {
    name: string;
    address: string;
    phone: string;
    gstin?: string;
  };
  orderType: OrderType;
  tableNumber?: number;
  tableId?: mongoose.Types.ObjectId;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  items: IOrderItemSnapshot[];
  pricing: IOrderPricingSnapshot;
  status: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    changedAt: Date;
    note?: string;
  }>;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paymentMethod: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'CASH_ON_DELIVERY' | 'PAY_AT_COUNTER' | 'MOCK_GATEWAY';
  deliveryOtp?: string; // 4-digit secure OTP for online delivery
  tableQrVerified: boolean;
  assignedWaiter?: mongoose.Types.ObjectId;
  assignedDeliveryPartner?: mongoose.Types.ObjectId;
  rewardVoucherClaimed: boolean;
  rewardVoucherId?: mongoose.Types.ObjectId;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'restaurant' | 'admin' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    restaurantDetails: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      gstin: { type: String },
    },
    orderType: {
      type: String,
      enum: ['dine_in', 'online', 'takeaway'],
      required: true,
      index: true,
    },
    tableNumber: { type: Number },
    tableId: { type: Schema.Types.ObjectId, ref: 'RestaurantTable' },
    deliveryAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      landmark: { type: String },
    },
    items: [
      {
        menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: { type: String, required: true },
        image: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        taxRate: { type: Number, default: 5 },
        taxAmount: { type: Number, default: 0 },
        customizations: [
          {
            groupName: { type: String },
            optionName: { type: String },
            price: { type: Number, default: 0 },
          },
        ],
        specialInstructions: { type: String },
        itemTotal: { type: Number, required: true },
      },
    ],
    pricing: {
      itemTotal: { type: Number, required: true },
      discountAmount: { type: Number, default: 0 },
      couponCode: { type: String },
      taxableAmount: { type: Number, required: true },
      applicableTaxes: { type: Number, required: true },
      serviceCharge: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      packagingFee: { type: Number, default: 0 },
      tipAmount: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: [
        'PLACED',
        'NEW',
        'PAYMENT_SUCCESS',
        'RESTAURANT_ACCEPTED',
        'ACCEPTED',
        'PREPARING',
        'READY',
        'SERVED',
        'PICKED_UP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
        'REFUNDED',
      ],
      default: 'PLACED',
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'CASH_ON_DELIVERY', 'PAY_AT_COUNTER', 'MOCK_GATEWAY'],
      default: 'UPI',
    },
    deliveryOtp: { type: String },
    tableQrVerified: { type: Boolean, default: false },
    assignedWaiter: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedDeliveryPartner: { type: Schema.Types.ObjectId, ref: 'User' },
    rewardVoucherClaimed: { type: Boolean, default: false },
    rewardVoucherId: { type: Schema.Types.ObjectId, ref: 'RewardVoucher' },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['customer', 'restaurant', 'admin', 'system'] },
  },
  { timestamps: true }
);

// Compound indexes for performant query filters
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ restaurant: 1, status: 1, createdAt: -1 });
OrderSchema.index({ restaurant: 1, orderType: 1, createdAt: -1 });

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
