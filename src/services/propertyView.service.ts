import mongoose, { type Types } from "mongoose";
import { Family, SocietyMember, User } from "../models/index.js";
import { httpError } from "../utils/httpError.js";
import { getPropertyById } from "./property.service.js";
import { listFamiliesByProperty } from "./family.service.js";

export async function getPropertyView(societyId: Types.ObjectId, propertyId: string) {
  const property = await getPropertyById(societyId, propertyId);

  const owners = await SocietyMember.find({
    societyId,
    propertyId: new mongoose.Types.ObjectId(propertyId),
    societyRole: "OWNER",
    status: "ACTIVE",
  }).lean();

  const primaryOwner = owners.find((o) => o.isPrimaryOwner) ?? owners[0];
  let ownerDisplay: {
    memberId: string;
    fullName: string;
    isResident: boolean;
    label: string;
  } | null = null;

  if (primaryOwner) {
    const user = await User.findById(primaryOwner.userId).select("fullName").lean();
    ownerDisplay = {
      memberId: primaryOwner._id.toString(),
      fullName: user?.fullName ?? "",
      isResident: primaryOwner.isResident,
      label: primaryOwner.isResident ? "Living" : "Not Living",
    };
  }

  const allFamilies = await listFamiliesByProperty(societyId, propertyId);
  const residentFamilies = allFamilies.filter((f) => f.isResident);

  return {
    property,
    owner: ownerDisplay,
    residents: residentFamilies,
    allFamilies,
  };
}

export async function listResidentFamilies(societyId: Types.ObjectId, propertyId: string) {
  if (!mongoose.isValidObjectId(propertyId)) throw httpError("Invalid property", 400);
  const families = await Family.find({
    societyId,
    propertyId: new mongoose.Types.ObjectId(propertyId),
  }).lean();

  const result = [];
  for (const family of families) {
    const member = await SocietyMember.findById(family.societyMemberId).lean();
    if (!member?.isResident) continue;
    const user = await User.findById(member.userId).select("fullName").lean();
    result.push({
      familyId: family._id.toString(),
      familyName: family.familyName,
      memberName: user?.fullName ?? "",
      societyRole: member.societyRole,
    });
  }
  return result;
}
