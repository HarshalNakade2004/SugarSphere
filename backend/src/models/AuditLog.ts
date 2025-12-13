import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  actorUserId: mongoose.Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId: mongoose.Types.ObjectId;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'update', 'delete', 'restock', 'status_change', 'block', 'unblock'],
    },
    resourceType: {
      type: String,
      required: true,
      enum: ['sweet', 'order', 'user', 'inventory'],
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    before: {
      type: Schema.Types.Mixed,
    },
    after: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
