import mongoose, { type Types } from "mongoose";
import { Family, FamilyMember, SocietyMember } from "../models/index.js";
import { httpError } from "../utils/httpError.js";
import { writeAuditLog } from "./audit.service.js";

export async function createFamily(
  societyId: Types.ObjectId,
  societyMemberId: Types.ObjectId,
  performedBy: Types.ObjectId,
  familyName?: string | null,
) {
  const member = await SocietyMember.findOne({ _id: societyMemberId, societyId, status: "ACTIVE" });
  if (!member) throw httpError("Member not found", 404);
  if (!member.isResident || !member.propertyId) {
    throw httpError("Family can only be created for residents with a property", 400);
  }

  const existing = await Family.findOne({ societyMemberId: member._id });
  if (existing) throw httpError("This member already has a family", 409);

  const family = await Family.create({
    societyId,
    propertyId: member.propertyId,
    societyMemberId: member._id,
    familyName: familyName?.trim() || null,
  });

  await writeAuditLog({
    action: "FAMILY_CREATED",
    performedBy,
    societyId,
    after: { familyId: family._id.toString(), propertyId: member.propertyId.toString() },
  });

  return family;
}

export async function createFamilyForCurrentUser(
  societyId: Types.ObjectId,
  userId: Types.ObjectId,
  familyName?: string | null,
) {
  const member = await SocietyMember.findOne({ societyId, userId, status: "ACTIVE" });
  if (!member) throw httpError("Membership not found", 404);
  return createFamily(societyId, member._id, userId, familyName);
}

export async function listFamiliesByProperty(societyId: Types.ObjectId, propertyId: string) {
  if (!mongoose.isValidObjectId(propertyId)) throw httpError("Invalid property", 400);
  const families = await Family.find({
    societyId,
    propertyId: new mongoose.Types.ObjectId(propertyId),
  }).lean();

  const memberIds = families.map((f) => f.societyMemberId);
  const members = await SocietyMember.find({ _id: { $in: memberIds } })
    .populate("userId", "fullName")
    .lean();

  const memberMap = new Map(members.map((m) => [m._id.toString(), m]));

  const result = [];
  for (const family of families) {
    const membersList = await FamilyMember.find({ familyId: family._id }).lean();
    const member = memberMap.get(family.societyMemberId.toString());
    const user = member?.userId as { fullName?: string } | undefined;
    result.push({
      id: family._id.toString(),
      familyName: family.familyName,
      propertyId: family.propertyId.toString(),
      societyMemberId: family.societyMemberId.toString(),
      memberName: user?.fullName ?? "",
      isResident: member?.isResident ?? false,
      societyRole: member?.societyRole,
      members: membersList.map((m) => ({
        id: m._id.toString(),
        name: m.name,
        relation: m.relation,
        age: m.age,
        gender: m.gender,
      })),
    });
  }
  return result;
}

export async function getMyFamily(societyId: Types.ObjectId, userId: Types.ObjectId) {
  const member = await SocietyMember.findOne({ societyId, userId, status: "ACTIVE" }).lean();
  if (!member) throw httpError("Membership not found", 404);

  const family = await Family.findOne({ societyMemberId: member._id }).lean();
  if (!family) return null;

  const members = await FamilyMember.find({ familyId: family._id }).lean();
  return {
    id: family._id.toString(),
    familyName: family.familyName,
    propertyId: family.propertyId.toString(),
    members: members.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      relation: m.relation,
      age: m.age,
      gender: m.gender,
    })),
  };
}

export async function addFamilyMember(
  societyId: Types.ObjectId,
  familyId: string,
  performedBy: Types.ObjectId,
  input: { name: string; relation: string; age?: number | null; gender?: string | null },
) {
  if (!mongoose.isValidObjectId(familyId)) throw httpError("Invalid family", 400);
  const family = await Family.findOne({ _id: familyId, societyId });
  if (!family) throw httpError("Family not found", 404);

  const row = await FamilyMember.create({
    familyId: family._id,
    name: input.name.trim(),
    relation: input.relation.trim(),
    age: input.age ?? null,
    gender: input.gender?.trim() || null,
  });

  await writeAuditLog({
    action: "FAMILY_MEMBER_ADDED",
    performedBy,
    societyId,
    after: { familyMemberId: row._id.toString(), familyId },
  });

  return row;
}

export async function deleteFamilyMember(
  societyId: Types.ObjectId,
  familyMemberId: string,
  performedBy: Types.ObjectId,
) {
  if (!mongoose.isValidObjectId(familyMemberId)) throw httpError("Invalid family member", 400);
  const row = await FamilyMember.findById(familyMemberId);
  if (!row) throw httpError("Family member not found", 404);

  const parentFamily = await Family.findById(row.familyId);
  if (!parentFamily || !parentFamily.societyId.equals(societyId)) {
    throw httpError("Family member not found", 404);
  }

  await FamilyMember.deleteOne({ _id: familyMemberId });

  await writeAuditLog({
    action: "FAMILY_MEMBER_DELETED",
    performedBy,
    societyId,
    before: { familyMemberId },
  });
}
