import type { Types } from "mongoose";
import { SocietyMember } from "../models/index.js";
import type { OwnershipType } from "../types/roles.js";

/**
 * Data-access layer for society members.
 * Services should use repositories for queries; business rules stay in services.
 */
export const memberRepository = {
  findActiveBySociety(societyId: Types.ObjectId) {
    return SocietyMember.find({ societyId, status: "ACTIVE" }).populate("userId", "fullName email phone").lean();
  },

  findPendingBySociety(societyId: Types.ObjectId) {
    return SocietyMember.find({ societyId, status: "PENDING" }).populate("userId", "fullName email phone").lean();
  },

  createPending(input: {
    societyId: Types.ObjectId;
    userId: Types.ObjectId;
    unitId: Types.ObjectId | null;
    flatNumber: string;
    floorNumber: number;
    ownershipType: OwnershipType;
  }) {
    return SocietyMember.create({
      ...input,
      status: "PENDING",
    });
  },
};
