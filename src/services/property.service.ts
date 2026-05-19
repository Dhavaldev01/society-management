import mongoose, { type Types } from "mongoose";
import { Property, Society, SocietyMember } from "../models/index.js";
import { httpError } from "../utils/httpError.js";
import { unitLabelForLayout } from "./societyUnit.service.js";

async function loadSociety(societyId: Types.ObjectId) {
  const society = await Society.findById(societyId).lean();
  if (!society) throw httpError("Society not found", 404);
  return society;
}

export function toPropertyDto(
  property: { _id: Types.ObjectId; propertyNumber: string; unitId: Types.ObjectId; floorNumber: number; status: string },
  unitName: string,
) {
  return {
    id: property._id.toString(),
    propertyNumber: property.propertyNumber,
    unitId: property.unitId.toString(),
    unitName,
    floorNumber: property.floorNumber,
    status: property.status,
  };
}

export async function listProperties(societyId: Types.ObjectId, unitId?: string) {
  const society = await loadSociety(societyId);
  const filter: Record<string, unknown> = { societyId, status: "ACTIVE" };
  if (unitId && mongoose.isValidObjectId(unitId)) {
    filter.unitId = new mongoose.Types.ObjectId(unitId);
  }

  const properties = await Property.find(filter).sort({ propertyNumber: 1 }).lean();
  const unitMap = new Map(
    (society.units ?? []).map((u) => [u._id.toString(), u.name]),
  );

  return properties.map((p) =>
    toPropertyDto(p, unitMap.get(p.unitId.toString()) ?? unitLabelForLayout(society.layoutType)),
  );
}

export async function getPropertyById(societyId: Types.ObjectId, propertyId: string) {
  if (!mongoose.isValidObjectId(propertyId)) throw httpError("Invalid property", 400);
  const property = await Property.findOne({ _id: propertyId, societyId }).lean();
  if (!property) throw httpError("Property not found", 404);
  const society = await loadSociety(societyId);
  const unit = society.units?.find((u) => u._id.toString() === property.unitId.toString());
  return toPropertyDto(property, unit?.name ?? "");
}

export async function findPropertyForMember(
  societyId: Types.ObjectId,
  propertyId: Types.ObjectId,
) {
  const property = await Property.findOne({ _id: propertyId, societyId });
  if (!property) throw httpError("Property not found", 404);
  return property;
}

export async function syncMemberFromProperty(
  member: InstanceType<typeof SocietyMember>,
  propertyId: Types.ObjectId,
) {
  const property = await findPropertyForMember(member.societyId, propertyId);
  member.propertyId = property._id;
  member.unitId = property.unitId;
  member.flatNumber = property.propertyNumber;
  member.floorNumber = property.floorNumber;
}

export async function findOrCreateProperty(
  societyId: Types.ObjectId,
  input: { unitId: string; propertyNumber: string; floorNumber?: number },
) {
  if (!mongoose.isValidObjectId(input.unitId)) {
    throw httpError("Invalid unit", 400);
  }
  const society = await Society.findById(societyId);
  if (!society) throw httpError("Society not found", 404);

  const unitObjectId = new mongoose.Types.ObjectId(input.unitId);
  const unit = society.units.find((u) => u._id.toString() === input.unitId);
  if (!unit) throw httpError("Unit not found", 404);

  const propertyNumber = input.propertyNumber.trim();
  if (!propertyNumber) throw httpError("Property number required", 400);

  let property = await Property.findOne({ societyId, propertyNumber });
  if (property) return property;

  property = await Property.create({
    societyId,
    unitId: unitObjectId,
    propertyNumber,
    floorNumber: input.floorNumber ?? 0,
    status: "ACTIVE",
  });
  return property;
}

export async function searchProperties(
  societyId: Types.ObjectId,
  query?: string,
  unitId?: string,
) {
  const all = await listProperties(societyId, unitId);
  if (!query?.trim()) return all;
  const q = query.trim().toLowerCase();
  return all.filter(
    (p) =>
      p.propertyNumber.toLowerCase().includes(q) ||
      p.unitName.toLowerCase().includes(q),
  );
}
