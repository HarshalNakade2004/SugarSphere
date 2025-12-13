import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  sweetId: mongoose.Types.ObjectId;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  currency: string;
  status: 'created' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'cancelled' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    sweetId: {
      type: Schema.Types.ObjectId,
      ref: 'Sweet',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'Order must have at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD'],
    },
    status: {
      type: String,
      enum: ['created', 'paid', 'processing', 'shipped', 'delivered', 'failed', 'cancelled', 'refunded'],
      default: 'created',
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
    },
    razorpaySignature: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
