import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IAdminAssignment {
  societyId: Types.ObjectId;
  userId: Types.ObjectId;
  assignedBy: Types.ObjectId;
  isActive: boolean;
}

export interface IAdminAssignmentDocument extends IAdminAssignment, Document {
  createdAt: Date;
}

const adminAssignmentSchema = new Schema<IAdminAssignmentDocument>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "adminAssignments" },
);

adminAssignmentSchema.index({ societyId: 1, userId: 1 }, { unique: true });

export const AdminAssignment: Model<IAdminAssignmentDocument> =
  mongoose.models.AdminAssignment ??
  mongoose.model<IAdminAssignmentDocument>("AdminAssignment", adminAssignmentSchema);
