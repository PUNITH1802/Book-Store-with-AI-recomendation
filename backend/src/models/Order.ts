import mongoose, { Document, Schema } from 'mongoose';
import { OrderStatus } from '../constants/orderStatus';

export interface IOrderItem {
  book: mongoose.Types.ObjectId;
  title: string;
  coverImage: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentIntentId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  couponCode?: string;
  notes?: string;
  trackingNumber?: string;
  statusHistory: { status: OrderStatus; timestamp: Date; note?: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    title: { type: String, required: true },
    coverImage: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Pending,
      index: true,
    },
    shippingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    paymentIntentId: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    couponCode: String,
    notes: String,
    trackingNumber: String,
    statusHistory: [
      {
        status: { type: String, enum: Object.values(OrderStatus) },
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true },
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
