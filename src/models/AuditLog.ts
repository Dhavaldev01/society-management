import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IAuditLog {
  action: string;
  performedBy: Types.ObjectId;
  societyId: Types.ObjectId;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

export interface IAuditLogDocument extends IAuditLog, Document {
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    action: { type: String, required: true, trim: true },
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    societyId: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    before: { type: Schema.Types.Mixed, default: {} },
    after: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "auditLogs" },
);

export const AuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog ?? mongoose.model<IAuditLogDocument>("AuditLog", auditLogSchema);
