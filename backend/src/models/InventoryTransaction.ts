import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryTransaction extends Document {
  _id: mongoose.Types.ObjectId;
  sweetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'purchase' | 'restock';
  quantityChange: number;
  note?: string;
  createdAt: Date;
}

const inventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    sweetId: {
      type: Schema.Types.ObjectId,
      ref: 'Sweet',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['purchase', 'restock'],
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

inventoryTransactionSchema.index({ createdAt: -1 });

export const InventoryTransaction = mongoose.model<IInventoryTransaction>(
  'InventoryTransaction',
  inventoryTransactionSchema
);
