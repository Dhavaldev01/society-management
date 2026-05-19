import mongoose, { type Document, type Model, Schema, Types } from "mongoose";
import { RESIDENCY_ROLES, type ResidencyRole } from "../types/societyMember.js";

export interface IPropertyHistory {
  societyId: Types.ObjectId;
  userId: Types.ObjectId;
  propertyId: Types.ObjectId;
  societyMemberId: Types.ObjectId;
  role: ResidencyRole;
  fromDate: Date;
  toDate: Date | null;
}

export interface IPropertyHistoryDocument extends IPropertyHistory, Document {
  createdAt: Date;
}

const propertyHistorySchema = new Schema<IPropertyHistoryDocument>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    societyMemberId: { type: Schema.Types.ObjectId, ref: "SocietyMember", required: true, index: true },
    role: { type: String, enum: RESIDENCY_ROLES, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "propertyHistories" },
);

propertyHistorySchema.index({ propertyId: 1, toDate: 1 });
propertyHistorySchema.index({ societyMemberId: 1, toDate: 1 });

export const PropertyHistory: Model<IPropertyHistoryDocument> =
  mongoose.models.PropertyHistory ??
  mongoose.model<IPropertyHistoryDocument>("PropertyHistory", propertyHistorySchema);
