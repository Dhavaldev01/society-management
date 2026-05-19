import type { ClientSession, Types } from "mongoose";
import { PropertyHistory } from "../models/index.js";
import type { ResidencyRole } from "../types/societyMember.js";

export async function closeOpenHistory(
  societyMemberId: Types.ObjectId,
  session?: ClientSession,
) {
  await PropertyHistory.updateMany(
    { societyMemberId, toDate: null },
    { toDate: new Date() },
    session ? { session } : undefined,
  );
}

export async function openHistory(
  input: {
    societyId: Types.ObjectId;
    userId: Types.ObjectId;
    propertyId: Types.ObjectId;
    societyMemberId: Types.ObjectId;
    role: ResidencyRole;
  },
  session?: ClientSession,
) {
  const doc = new PropertyHistory({
    societyId: input.societyId,
    userId: input.userId,
    propertyId: input.propertyId,
    societyMemberId: input.societyMemberId,
    role: input.role,
    fromDate: new Date(),
    toDate: null,
  });
  await doc.save(session ? { session } : undefined);
  return doc;
}

export async function listPropertyHistory(societyId: Types.ObjectId, propertyId: string) {
  return PropertyHistory.find({ societyId, propertyId })
    .sort({ fromDate: -1 })
    .lean();
}
