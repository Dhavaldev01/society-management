import mongoose, { type Types } from "mongoose";
import {
  Family,
  FamilyMember,
  SocietyMember,
  User,
  Vehicle,
} from "../models/index.js";
import type { CompleteResidentInput, CompleteSuperAdminResidencyInput } from "../validators/residentSetup.validator.js";
import { httpError } from "../utils/httpError.js";
import { hashPassword } from "../utils/password.js";
import { writeAuditLog } from "./audit.service.js";
import { createFamily } from "./family.service.js";
import { clearPrimaryOwner } from "./societyMemberResidency.service.js";
import { closeOpenHistory, openHistory } from "./propertyHistory.service.js";
import {
  findOrCreateProperty,
  findPropertyForMember,
  syncMemberFromProperty,
} from "./property.service.js";
import { AdminAssignment } from "../models/AdminAssignment.js";

async function resolvePropertyId(
  societyId: Types.ObjectId,
  property: CompleteSuperAdminResidencyInput["property"],
) {
  if (property.propertyId && mongoose.isValidObjectId(property.propertyId)) {
    const id = new mongoose.Types.ObjectId(property.propertyId);
    await findPropertyForMember(societyId, id);
    return id;
  }
  const created = await findOrCreateProperty(societyId, {
    unitId: property.unitId,
    propertyNumber: property.flatNumber,
    floorNumber: property.floorNumber,
  });
  return created._id;
}

async function saveVehicles(
  societyId: Types.ObjectId,
  societyMemberId: Types.ObjectId,
  vehicles: CompleteSuperAdminResidencyInput["vehicles"],
) {
  if (!vehicles.length) return;
  await Vehicle.insertMany(
    vehicles
      .filter((v) => v.number?.trim() || v.type?.trim())
      .map((v) => ({
        societyId,
        societyMemberId,
        type: v.type?.trim() ?? "",
        number: v.number?.trim() ?? "",
        brand: v.brand?.trim() ?? "",
        parkingSlot: v.parkingSlot?.trim() ?? "",
      })),
  );
}

async function saveFamilyIfResident(
  societyId: Types.ObjectId,
  member: InstanceType<typeof SocietyMember>,
  isResident: boolean,
  familyName: string | null | undefined,
  familyMembers: CompleteSuperAdminResidencyInput["familyMembers"],
  performedBy: Types.ObjectId,
) {
  if (!isResident) return;
  const family = await createFamily(societyId, member._id, performedBy, familyName ?? null);
  for (const fm of familyMembers) {
    await FamilyMember.create({
      familyId: family._id,
      name: fm.name.trim(),
      relation: fm.relation.trim(),
      age: typeof fm.age === "number" ? fm.age : null,
      gender: fm.gender?.trim() || null,
    });
  }
}

function applyMemberRole(
  member: InstanceType<typeof SocietyMember>,
  residentType: "OWNER" | "TENANT",
  isResident: boolean,
  isPrimaryOwner: boolean,
) {
  member.societyRole = residentType;
  member.ownershipType = residentType;
  member.isResident = isResident;
  member.isPrimaryOwner = residentType === "OWNER" && isPrimaryOwner;
}

export async function completeSuperAdminResidency(
  societyId: Types.ObjectId,
  userId: Types.ObjectId,
  input: CompleteSuperAdminResidencyInput,
) {
  const member = await SocietyMember.findOne({ societyId, userId, status: "ACTIVE" });
  if (!member) throw httpError("Membership not found", 404);

  if (member.superAdminResidencyCompleted && member.propertyId) {
    throw httpError("Residency setup already completed", 400);
  }

  if (input.residentType === "TENANT" && !input.isResident) {
    throw httpError("Tenant must be a resident", 400);
  }

  const propertyObjectId = await resolvePropertyId(societyId, input.property);

  if (input.residentType === "OWNER" && input.isPrimaryOwner) {
    await clearPrimaryOwner(propertyObjectId);
  }

  applyMemberRole(member, input.residentType, input.isResident, input.isPrimaryOwner);
  await syncMemberFromProperty(member, propertyObjectId);
  member.onboardingCompleted = true;
  member.superAdminResidencyCompleted = true;
  await member.save();

  await closeOpenHistory(member._id);
  if (input.isResident) {
    await openHistory({
      societyId,
      userId,
      propertyId: propertyObjectId,
      societyMemberId: member._id,
      role: input.residentType,
    });
    await saveFamilyIfResident(
      societyId,
      member,
      true,
      input.familyName,
      input.familyMembers,
      userId,
    );
  }

  await saveVehicles(societyId, member._id, input.vehicles);

  await writeAuditLog({
    action: "SUPER_ADMIN_RESIDENCY_COMPLETED",
    performedBy: userId,
    societyId,
    after: { propertyId: propertyObjectId.toString(), role: input.residentType },
  });

  return getResidencyFlowStatus(societyId, userId);
}

export async function completeResidentRegistration(
  societyId: Types.ObjectId,
  performedBy: Types.ObjectId,
  input: CompleteResidentInput,
) {
  const email = input.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) throw httpError("Email already registered", 409);

  const isOwnerOnly = input.accountKind === "OWNER_ONLY";
  const isResident = isOwnerOnly
    ? false
    : input.accountKind === "MEMBER"
      ? true
      : input.accountKind === "ADMIN"
        ? input.isResident
        : input.isResident;

  if (input.residentType === "TENANT" && !isResident) {
    throw httpError("Tenant must be a resident", 400);
  }

  const propertyObjectId = await resolvePropertyId(societyId, input.property);

  const isPrimary =
    input.residentType === "OWNER" && input.isPrimaryOwner && !isOwnerOnly;

  if (isPrimary) await clearPrimaryOwner(propertyObjectId);

  const user = await User.create({
    email,
    passwordHash: await hashPassword(input.password),
    fullName: input.fullName.trim(),
    phone: input.phone?.trim() || null,
    role: input.accountKind === "ADMIN" ? "ADMIN" : "MEMBER",
    isActive: input.accountKind !== "MEMBER",
  });

  const societyRole =
    input.accountKind === "ADMIN" ? "ADMIN" : input.residentType;

  const member = await SocietyMember.create({
    societyId,
    userId: user._id,
    propertyId: propertyObjectId,
    societyRole,
    isResident,
    isPrimaryOwner: isPrimary,
    onboardingCompleted: true,
    superAdminResidencyCompleted: true,
    ownershipType: input.residentType,
    status: input.accountKind === "MEMBER" ? "PENDING" : "ACTIVE",
    unitId: null,
    flatNumber: "",
    floorNumber: 0,
  });

  await syncMemberFromProperty(member, propertyObjectId);
  await member.save();

  if (input.accountKind === "ADMIN") {
    await AdminAssignment.create({
      societyId,
      userId: user._id,
      assignedBy: performedBy,
      isActive: true,
    });
  }

  if (isResident) {
    await openHistory({
      societyId,
      userId: user._id,
      propertyId: propertyObjectId,
      societyMemberId: member._id,
      role: input.residentType,
    });
    await saveFamilyIfResident(
      societyId,
      member,
      true,
      input.familyName,
      input.familyMembers,
      performedBy,
    );
    await saveVehicles(societyId, member._id, input.vehicles);
  }

  await writeAuditLog({
    action: "RESIDENT_REGISTERED_COMPLETE",
    performedBy,
    societyId,
    after: { memberId: member._id.toString(), userId: user._id.toString() },
  });

  return { memberId: member._id.toString(), userId: user._id.toString(), status: member.status };
}

export async function getResidencyFlowStatus(societyId: Types.ObjectId, userId: Types.ObjectId) {
  const member = await SocietyMember.findOne({ societyId, userId, status: "ACTIVE" }).lean();
  if (!member) throw httpError("Membership not found", 404);

  const needsSuperAdminResidency =
    member.societyRole === "ADMIN" &&
    !member.superAdminResidencyCompleted &&
    !member.propertyId;

  return {
    onboardingCompleted: member.onboardingCompleted,
    superAdminResidencyCompleted: member.superAdminResidencyCompleted,
    isResident: member.isResident,
    societyRole: member.societyRole,
    propertyId: member.propertyId?.toString() ?? null,
    needsResidencySetup: needsSuperAdminResidency,
    needsSuperAdminResidency,
  };
}
