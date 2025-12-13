import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailVerification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const emailVerificationSchema = new Schema<IEmailVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index to auto-delete expired tokens
    },
  },
  {
    timestamps: true,
  }
);

export const EmailVerification = mongoose.model<IEmailVerification>(
  'EmailVerification',
  emailVerificationSchema
);
