import mongoose, { type Document, type Model, Schema, Types } from "mongoose";
import {
  CHANGE_REQUEST_TYPES,
  CHANGE_STATUSES,
  CHANGE_TARGET_TYPES,
  type ChangeRequestType,
  type ChangeStatus,
  type ChangeTargetType,
} from "../types/changeRequest.js";

export interface IChangeRequest {
  societyId: Types.ObjectId;
  requestedBy: Types.ObjectId;
  targetType: ChangeTargetType;
  targetId: Types.ObjectId | null;
  requestType: ChangeRequestType;
  oldData: Record<string, unknown>;
  newData: Record<string, unknown>;
  status: ChangeStatus;
  approvedBy: Types.ObjectId | null;
}

export interface IChangeRequestDocument extends IChangeRequest, Document {
  createdAt: Date;
  updatedAt: Date;
}

const changeRequestSchema = new Schema<IChangeRequestDocument>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: CHANGE_TARGET_TYPES, required: true },
    targetId: { type: Schema.Types.ObjectId, default: null },
    requestType: { type: String, enum: CHANGE_REQUEST_TYPES, required: true },
    oldData: { type: Schema.Types.Mixed, default: {} },
    newData: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: CHANGE_STATUSES, default: "PENDING" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, collection: "changeRequests" },
);

export const ChangeRequest: Model<IChangeRequestDocument> =
  mongoose.models.ChangeRequest ??
  mongoose.model<IChangeRequestDocument>("ChangeRequest", changeRequestSchema);
