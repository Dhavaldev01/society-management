import mongoose, { type Types } from "mongoose";
import { SocietyMember, User } from "../models/index.js";
import { hashPassword } from "../utils/password.js";
import { httpError } from "../utils/httpError.js";
import { writeAuditLog } from "./audit.service.js";
import type { OwnershipType } from "../types/roles.js";

export async function createMemberPending(
  societyId: Types.ObjectId,
  requestedBy: Types.ObjectId,
  input: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    unitId?: string | null;
    flatNumber?: string;
    floorNumber?: number;
    ownershipType?: OwnershipType;
  },
) {
  const email = input.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) throw httpError("Email already registered", 409);

  const user = await User.create({
    email,
    passwordHash: await hashPassword(input.password),
    fullName: input.fullName.trim(),
    phone: input.phone?.trim() || null,
    role: "MEMBER",
    isActive: false,
  });

  const member = await SocietyMember.create({
    societyId,
    userId: user._id,
    unitId:
      input.unitId && mongoose.isValidObjectId(input.unitId)
        ? new mongoose.Types.ObjectId(input.unitId)
        : null,
    flatNumber: input.flatNumber?.trim() || "",
    floorNumber: input.floorNumber ?? 0,
    ownershipType: input.ownershipType ?? "OWNER",
    status: "PENDING",
  });

  await writeAuditLog({
    action: "MEMBER_CREATED_PENDING",
    performedBy: requestedBy,
    societyId,
    after: { memberId: member._id.toString(), userId: user._id.toString(), email },
  });

  return { user, member };
}

export async function listPendingMembers(societyId: Types.ObjectId) {
  const pending = await SocietyMember.find({ societyId, status: "PENDING" })
    .populate("userId", "fullName email phone role isActive")
    .sort({ createdAt: -1 })
    .lean();
  return pending;
}

export async function listActiveMembers(societyId: Types.ObjectId) {
  return SocietyMember.find({ societyId, status: "ACTIVE" })
    .populate("userId", "fullName email phone role isActive")
    .sort({ createdAt: -1 })
    .lean();
}

export async function approveMember(
  societyId: Types.ObjectId,
  memberId: string,
  approvedBy: Types.ObjectId,
) {
  const member = await SocietyMember.findOne({ _id: memberId, societyId });
  if (!member) throw httpError("Member not found", 404);
  if (member.status !== "PENDING") throw httpError("Member is not pending approval", 400);

  const before = { status: member.status, userId: member.userId.toString() };
  member.status = "ACTIVE";
  await member.save();

  await User.findByIdAndUpdate(member.userId, { isActive: true });

  await writeAuditLog({
    action: "MEMBER_APPROVED",
    performedBy: approvedBy,
    societyId,
    before,
    after: { status: "ACTIVE", userId: member.userId.toString() },
  });

  return member;
}

export async function rejectMember(
  societyId: Types.ObjectId,
  memberId: string,
  rejectedBy: Types.ObjectId,
) {
  const member = await SocietyMember.findOne({ _id: memberId, societyId });
  if (!member) throw httpError("Member not found", 404);
  if (member.status !== "PENDING") throw httpError("Member is not pending approval", 400);

  member.status = "REJECTED";
  await member.save();
  await User.findByIdAndUpdate(member.userId, { isActive: false });

  await writeAuditLog({
    action: "MEMBER_REJECTED",
    performedBy: rejectedBy,
    societyId,
    before: { status: "PENDING" },
    after: { status: "REJECTED" },
  });

  return member;
}
