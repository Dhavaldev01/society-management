import type { Types } from "mongoose";
import { Society, SocietyMember } from "../models/index.js";
import type { IUserDocument } from "../models/User.js";
import { httpError } from "../utils/httpError.js";

export async function getPrimarySocietyForUser(
  userId: Types.ObjectId,
): Promise<{ societyId: string; societyName: string } | null> {
  const membership = await SocietyMember.findOne({
    userId,
    status: "ACTIVE",
  })
    .sort({ updatedAt: -1 })
    .lean();

  if (!membership) return null;

  const society = await Society.findById(membership.societyId).select("name").lean();
  if (!society) return null;

  return {
    societyId: membership.societyId.toString(),
    societyName: society.name,
  };
}

export async function attachSocietyContext(user: IUserDocument) {
  const society = await getPrimarySocietyForUser(user._id);
  return {
    societyId: society?.societyId ?? null,
    societyName: society?.societyName ?? null,
  };
}

/** Login gate: user active + at least one ACTIVE society membership (except pending-only users). */
export async function assertUserCanLogin(user: IUserDocument): Promise<void> {
  if (!user.isActive) {
    throw httpError("Account is not active. Wait for super admin approval.", 403);
  }

  const activeMembership = await SocietyMember.findOne({
    userId: user._id,
    status: "ACTIVE",
  }).lean();

  if (!activeMembership) {
    throw httpError("No active society membership. Contact your society admin.", 403);
  }
}

export async function getUserSocietyId(userId: string, role: IUserDocument["role"]): Promise<string | null> {
  if (role === "SUPER_ADMIN") {
    const society = await Society.findOne({ createdBy: userId }).select("_id").lean();
    if (society) return society._id.toString();
  }
  const membership = await SocietyMember.findOne({ userId, status: "ACTIVE" }).sort({ updatedAt: -1 }).lean();
  return membership?.societyId.toString() ?? null;
}
