import mongoose, { Document, Schema } from 'mongoose';

export interface IReview {
  userId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ISweet extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isActive: boolean;
  reviews: IReview[];
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const sweetSchema = new Schema<ISweet>(
  {
    name: {
      type: String,
      required: [true, 'Sweet name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    reviews: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          userName: { type: String, required: true },
          rating: { type: Number, required: true, min: 1, max: 5 },
          comment: { type: String, required: true, maxlength: 500 },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
sweetSchema.index({ name: 'text', description: 'text', category: 'text' });
sweetSchema.index({ category: 1, price: 1 });
sweetSchema.index({ isActive: 1 });

export const Sweet = mongoose.model<ISweet>('Sweet', sweetSchema);
