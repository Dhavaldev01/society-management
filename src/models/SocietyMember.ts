import mongoose, { type Document, type Model, Schema, Types } from "mongoose";
import { MEMBER_STATUSES, OWNERSHIP_TYPES, type MemberStatus, type OwnershipType } from "../types/roles.js";
import { SOCIETY_MEMBER_ROLES, type SocietyMemberRole } from "../types/societyMember.js";

export interface ISocietyMember {
  societyId: Types.ObjectId;
  userId: Types.ObjectId;
  propertyId: Types.ObjectId | null;
  societyRole: SocietyMemberRole;
  isResident: boolean;
  isPrimaryOwner: boolean;
  onboardingCompleted: boolean;
  superAdminResidencyCompleted: boolean;
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
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", default: null },
    societyRole: { type: String, enum: SOCIETY_MEMBER_ROLES, default: "ADMIN" },
    isResident: { type: Boolean, default: false },
    isPrimaryOwner: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    superAdminResidencyCompleted: { type: Boolean, default: false },
    unitId: { type: Schema.Types.ObjectId, default: null },
    flatNumber: { type: String, default: "", trim: true },
    floorNumber: { type: Number, default: 0, min: 0 },
    ownershipType: { type: String, enum: OWNERSHIP_TYPES, default: "OWNER" },
    status: { type: String, enum: MEMBER_STATUSES, default: "PENDING" },
  },
  { timestamps: true, collection: "societyMembers" },
);

societyMemberSchema.index({ societyId: 1, userId: 1 }, { unique: true });
societyMemberSchema.index(
  { propertyId: 1, isPrimaryOwner: 1 },
  { unique: true, partialFilterExpression: { isPrimaryOwner: true, propertyId: { $type: "objectId" } } },
);

export const SocietyMember: Model<ISocietyMemberDocument> =
  mongoose.models.SocietyMember ??
  mongoose.model<ISocietyMemberDocument>("SocietyMember", societyMemberSchema);
