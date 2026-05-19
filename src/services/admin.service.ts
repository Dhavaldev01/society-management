import mongoose, { type Types } from "mongoose";
import { AdminAssignment, SocietyMember, User } from "../models/index.js";
import { hashPassword } from "../utils/password.js";
import { httpError } from "../utils/httpError.js";
import { writeAuditLog } from "./audit.service.js";
import type { OwnershipType } from "../types/roles.js";

export async function assignAdmin(
  societyId: Types.ObjectId,
  assignedBy: Types.ObjectId,
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

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    email,
    passwordHash,
    fullName: input.fullName.trim(),
    phone: input.phone?.trim() || null,
    role: "ADMIN",
    isActive: true,
  });

  await AdminAssignment.create({
    societyId,
    userId: user._id,
    assignedBy,
    isActive: true,
  });

  await SocietyMember.create({
    societyId,
    userId: user._id,
    unitId:
      input.unitId && mongoose.isValidObjectId(input.unitId)
        ? new mongoose.Types.ObjectId(input.unitId)
        : null,
    flatNumber: input.flatNumber?.trim() || "",
    floorNumber: input.floorNumber ?? 0,
    ownershipType: input.ownershipType ?? "OWNER",
    status: "ACTIVE",
  });

  await writeAuditLog({
    action: "ADMIN_ASSIGNED",
    performedBy: assignedBy,
    societyId,
    after: { adminUserId: user._id.toString(), email: user.email },
  });

  return user;
}

export async function listAdmins(societyId: Types.ObjectId) {
  const assignments = await AdminAssignment.find({ societyId, isActive: true }).lean();
  const userIds = assignments.map((a) => a.userId);
  return User.find({ _id: { $in: userIds } }).select("-passwordHash").lean();
}
