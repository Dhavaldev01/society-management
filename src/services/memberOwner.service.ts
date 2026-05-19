import mongoose, { type Types } from "mongoose";
import { SocietyMember, User } from "../models/index.js";
import { hashPassword } from "../utils/password.js";
import { httpError } from "../utils/httpError.js";
import { writeAuditLog } from "./audit.service.js";
import { closeOpenHistory, openHistory } from "./propertyHistory.service.js";
import { clearPrimaryOwner } from "./societyMemberResidency.service.js";
import { findPropertyForMember, syncMemberFromProperty } from "./property.service.js";

export async function addOwner(
  societyId: Types.ObjectId,
  performedBy: Types.ObjectId,
  input: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    propertyId: string;
    isResident: boolean;
    isPrimaryOwner: boolean;
  },
) {
  const email = input.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) throw httpError("Email already registered", 409);

  if (!mongoose.isValidObjectId(input.propertyId)) throw httpError("Invalid property", 400);
  const propertyObjectId = new mongoose.Types.ObjectId(input.propertyId);
  await findPropertyForMember(societyId, propertyObjectId);

  if (input.isPrimaryOwner) {
    await clearPrimaryOwner(propertyObjectId);
  }

  const user = await User.create({
    email,
    passwordHash: await hashPassword(input.password),
    fullName: input.fullName.trim(),
    phone: input.phone?.trim() || null,
    role: "MEMBER",
    isActive: true,
  });

  const member = await SocietyMember.create({
    societyId,
    userId: user._id,
    propertyId: propertyObjectId,
    societyRole: "OWNER",
    isResident: input.isResident,
    isPrimaryOwner: input.isPrimaryOwner,
    onboardingCompleted: true,
    ownershipType: "OWNER",
    status: "ACTIVE",
    unitId: null,
    flatNumber: "",
    floorNumber: 0,
  });

  await syncMemberFromProperty(member, propertyObjectId);
  await member.save();

  await openHistory({
    societyId,
    userId: user._id,
    propertyId: propertyObjectId,
    societyMemberId: member._id,
    role: "OWNER",
  });

  await writeAuditLog({
    action: "OWNER_ADDED",
    performedBy,
    societyId,
    after: { memberId: member._id.toString(), propertyId: input.propertyId },
  });

  return { user, member };
}
