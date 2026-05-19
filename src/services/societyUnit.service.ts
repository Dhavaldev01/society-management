import type { Types } from "mongoose";
import { Society, SocietyMember, type ISocietyUnit } from "../models/index.js";
import type { SocietyLayoutType } from "../types/roles.js";
import { httpError } from "../utils/httpError.js";
import { writeAuditLog } from "./audit.service.js";

export type UnitInput = {
  name: string;
  totalHouses: number;
  totalFamilies: number;
  totalFloors?: number;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
};

export function unitLabelForLayout(layoutType: SocietyLayoutType): "Block" | "Wing" {
  return layoutType === "BLOCK_WISE" ? "Block" : "Wing";
}

async function occupiedCountByUnit(societyId: Types.ObjectId): Promise<Map<string, number>> {
  const rows = await SocietyMember.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { societyId, status: "ACTIVE", unitId: { $ne: null } } },
    { $group: { _id: "$unitId", count: { $sum: 1 } } },
  ]);
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row._id.toString(), row.count);
  }
  return map;
}

export function toUnitDto(unit: ISocietyUnit, layoutType: SocietyLayoutType, occupied: number) {
  const vacant = Math.max(0, unit.totalHouses - occupied);
  return {
    id: unit._id?.toString() ?? "",
    name: unit.name,
    type: unitLabelForLayout(layoutType),
    totalHouses: unit.totalHouses,
    totalFamilies: unit.totalFamilies,
    totalFloors: unit.totalFloors,
    description: unit.description,
    status: unit.status,
    houses: unit.totalHouses,
    occupied,
    vacant,
    families: occupied,
    createdAt: unit.createdAt,
    updatedAt: unit.updatedAt,
  };
}

async function loadSociety(societyId: Types.ObjectId) {
  const society = await Society.findById(societyId);
  if (!society) throw httpError("Society not found", 404);
  return society;
}

export async function listUnits(societyId: Types.ObjectId) {
  const society = await loadSociety(societyId);
  const occupiedMap = await occupiedCountByUnit(societyId);
  return society.units
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((u) => toUnitDto(u, society.layoutType, occupiedMap.get(u._id.toString()) ?? 0));
}

export async function createUnit(
  societyId: Types.ObjectId,
  performedBy: Types.ObjectId,
  input: UnitInput,
) {
  const society = await loadSociety(societyId);
  const label = unitLabelForLayout(society.layoutType);
  const name = input.name.trim();

  if (society.units.some((u) => u.name.toLowerCase() === name.toLowerCase())) {
    throw httpError(`${label} with this name already exists`, 409);
  }

  society.units.push({
    name,
    totalHouses: input.totalHouses,
    totalFamilies: input.totalFamilies,
    totalFloors: input.totalFloors ?? 0,
    description: input.description?.trim() ?? "",
    status: input.status ?? "ACTIVE",
  });

  await society.save();
  const unit = society.units[society.units.length - 1]!;

  await writeAuditLog({
    action: "UNIT_CREATED",
    performedBy,
    societyId,
    after: { unitId: unit._id.toString(), name: unit.name },
  });

  return toUnitDto(unit, society.layoutType, 0);
}

export async function updateUnit(
  societyId: Types.ObjectId,
  unitId: string,
  performedBy: Types.ObjectId,
  input: Partial<UnitInput>,
) {
  const society = await loadSociety(societyId);
  const label = unitLabelForLayout(society.layoutType);
  const unit = society.units.find((u) => u._id.toString() === unitId);
  if (!unit) throw httpError(`${label} not found`, 404);

  if (input.name !== undefined) {
    const name = input.name.trim();
    const dup = society.units.find(
      (u) => u._id.toString() !== unitId && u.name.toLowerCase() === name.toLowerCase(),
    );
    if (dup) throw httpError(`${label} name already in use`, 409);
    unit.name = name;
  }
  if (input.totalHouses !== undefined) unit.totalHouses = input.totalHouses;
  if (input.totalFamilies !== undefined) unit.totalFamilies = input.totalFamilies;
  if (input.totalFloors !== undefined) unit.totalFloors = input.totalFloors;
  if (input.description !== undefined) unit.description = input.description.trim();
  if (input.status !== undefined) unit.status = input.status;

  await society.save();

  const occupiedMap = await occupiedCountByUnit(societyId);
  await writeAuditLog({
    action: "UNIT_UPDATED",
    performedBy,
    societyId,
    after: { unitId, name: unit.name },
  });

  return toUnitDto(unit, society.layoutType, occupiedMap.get(unitId) ?? 0);
}

export async function deleteUnit(societyId: Types.ObjectId, unitId: string, performedBy: Types.ObjectId) {
  const society = await loadSociety(societyId);
  const label = unitLabelForLayout(society.layoutType);
  const unitIndex = society.units.findIndex((u) => u._id.toString() === unitId);
  if (unitIndex < 0) throw httpError(`${label} not found`, 404);
  const unit = society.units[unitIndex]!;

  const linked = await SocietyMember.countDocuments({
    societyId,
    unitId: unit._id,
    status: "ACTIVE",
  });
  if (linked > 0) {
    throw httpError(`Cannot delete: ${linked} active member(s) assigned to this ${label.toLowerCase()}`, 400);
  }

  const name = unit.name;
  society.units.splice(unitIndex, 1);
  await society.save();

  await writeAuditLog({
    action: "UNIT_DELETED",
    performedBy,
    societyId,
    before: { unitId, name },
    after: {},
  });
}
