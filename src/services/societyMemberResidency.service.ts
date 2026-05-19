import mongoose, { type Types } from "mongoose";
import { SocietyMember, User } from "../models/index.js";
import type { ResidencyRole } from "../types/societyMember.js";
import { httpError } from "../utils/httpError.js";
import { writeAuditLog } from "./audit.service.js";
import { closeOpenHistory, openHistory } from "./propertyHistory.service.js";
import { findPropertyForMember, syncMemberFromProperty } from "./property.service.js";
import { getResidencyFlowStatus } from "./residentSetup.service.js";

export async function getOnboardingStatus(societyId: Types.ObjectId, userId: Types.ObjectId) {
  return getResidencyFlowStatus(societyId, userId);
}

export async function skipResidencySetup(societyId: Types.ObjectId, userId: Types.ObjectId) {
  const member = await SocietyMember.findOne({ societyId, userId, status: "ACTIVE" });
  if (!member) throw httpError("Membership not found", 404);

  member.onboardingCompleted = true;
  member.superAdminResidencyCompleted = true;
  member.societyRole = "ADMIN";
  member.isResident = false;
  member.propertyId = null;
  member.isPrimaryOwner = false;
  await member.save();

  return getOnboardingStatus(societyId, userId);
}

export async function clearPrimaryOwner(propertyId: Types.ObjectId, session?: mongoose.ClientSession) {
  await SocietyMember.updateMany(
    { propertyId, isPrimaryOwner: true },
    { isPrimaryOwner: false },
    session ? { session } : undefined,
  );
}

export async function assignResidency(
  societyId: Types.ObjectId,
  userId: Types.ObjectId,
  input: { propertyId: string; societyRole: ResidencyRole },
) {
  const member = await SocietyMember.findOne({ societyId, userId, status: "ACTIVE" });
  if (!member) throw httpError("Membership not found", 404);

  if (!mongoose.isValidObjectId(input.propertyId)) {
    throw httpError("Invalid property", 400);
  }

  const propertyObjectId = new mongoose.Types.ObjectId(input.propertyId);
  await findPropertyForMember(societyId, propertyObjectId);

  if (input.societyRole === "TENANT") {
    member.societyRole = "TENANT";
    member.isResident = true;
    member.isPrimaryOwner = false;
    member.ownershipType = "TENANT";
  } else {
    member.societyRole = "OWNER";
    member.isResident = true;
    member.ownershipType = "OWNER";
    await clearPrimaryOwner(propertyObjectId);
    member.isPrimaryOwner = true;
  }

  await syncMemberFromProperty(member, propertyObjectId);
  member.onboardingCompleted = true;
  member.superAdminResidencyCompleted = true;
  await member.save();

  await closeOpenHistory(member._id);
  await openHistory({
    societyId,
    userId: member.userId,
    propertyId: propertyObjectId,
    societyMemberId: member._id,
    role: input.societyRole,
  });

  await writeAuditLog({
    action: "RESIDENCY_ASSIGNED",
    performedBy: userId,
    societyId,
    after: { memberId: member._id.toString(), propertyId: input.propertyId, role: input.societyRole },
  });

  return getOnboardingStatus(societyId, userId);
}
