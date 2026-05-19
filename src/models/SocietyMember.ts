import mongoose, { type Document, type Model, Schema, Types } from "mongoose";
import { MEMBER_STATUSES, OWNERSHIP_TYPES, type MemberStatus, type OwnershipType } from "../types/roles.js";

export interface ISocietyMember {
  societyId: Types.ObjectId;
  userId: Types.ObjectId;
  /** References `units._id` on the society document */
  unitId: Types.ObjectId | null;
  flatNumber: string;
  floorNumber: number;
  ownershipType: OwnershipType;
  status: MemberStatus;
}

export interface ISocietyMemberDocument extends ISocietyMember, Document {
  createdAt: Date;
  updatedAt: Date;
}

const societyMemberSchema = new Schema<ISocietyMemberDocument>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    unitId: { type: Schema.Types.ObjectId, default: null },
    flatNumber: { type: String, default: "", trim: true },
    floorNumber: { type: Number, default: 0, min: 0 },
    ownershipType: { type: String, enum: OWNERSHIP_TYPES, default: "OWNER" },
    status: { type: String, enum: MEMBER_STATUSES, default: "PENDING" },
  },
  { timestamps: true, collection: "societyMembers" },
);

societyMemberSchema.index({ societyId: 1, userId: 1 }, { unique: true });

export const SocietyMember: Model<ISocietyMemberDocument> =
  mongoose.models.SocietyMember ??
  mongoose.model<ISocietyMemberDocument>("SocietyMember", societyMemberSchema);
