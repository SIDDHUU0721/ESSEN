import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string; // e.g. "INV-2026-83921"
  order: mongoose.Types.ObjectId;
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  restaurantDetails: {
    name: string;
    address: string;
    phone: string;
    gstin?: string;
    fssaiLicense?: string;
  };
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    billingAddress?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    itemTotal: number;
  }>;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  serviceCharge: number;
  deliveryFee: number;
  packagingFee: number;
  tip: number;
  grandTotal: number;
  paymentMethod: string;
  transactionId: string;
  paymentStatus: string;
  invoiceDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    orderNumber: { type: String, required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    restaurantDetails: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      gstin: { type: String },
      fssaiLicense: { type: String },
    },
    customerDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      billingAddress: { type: String },
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        taxRate: { type: Number, default: 5 },
        taxAmount: { type: Number, default: 0 },
        itemTotal: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true },
    cgst: { type: Number, required: true },
    sgst: { type: Number, required: true },
    serviceCharge: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    packagingFee: { type: Number, default: 0 },
    tip: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, required: true },
    paymentStatus: { type: String, default: 'PAID' },
    invoiceDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

InvoiceSchema.index({ customer: 1, invoiceDate: -1 });

export const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
