import type { Types } from "mongoose";
import { Society, SocietyMember } from "../models/index.js";
import { httpError } from "../utils/httpError.js";
import { unitLabelForLayout } from "./societyUnit.service.js";

export async function getSocietyOverview(societyId: Types.ObjectId) {
  const society = await Society.findById(societyId).lean();
  if (!society) throw httpError("Society not found", 404);

  const units = society.units ?? [];
  const totalHouses = units.reduce((sum, u) => sum + (u.totalHouses ?? 0), 0);
  const totalFamiliesCapacity = units.reduce((sum, u) => sum + (u.totalFamilies ?? 0), 0);
  const occupiedMembers = await SocietyMember.countDocuments({ societyId, status: "ACTIVE" });

  const layoutType = society.layoutType;
  const unitLabel = unitLabelForLayout(layoutType);

  return {
    society: {
      id: society._id.toString(),
      name: society.name,
      city: society.city,
      layoutType,
      structureMeta: society.structureMeta,
      units,
    },
    labels: {
      unit: unitLabel,
      unitPlural: layoutType === "BLOCK_WISE" ? "Blocks" : "Wings",
      addTitle: layoutType === "BLOCK_WISE" ? "Add Block" : "Add Wing",
      namePlaceholder: layoutType === "BLOCK_WISE" ? "e.g. Block - A" : "e.g. Wing - A",
      listTitle: layoutType === "BLOCK_WISE" ? "Block List" : "Wing List",
      statsLabel: "Blocks/Wings",
    },
    stats: {
      totalUnits: units.length,
      totalHouses,
      totalFamilies: totalFamiliesCapacity > 0 ? totalFamiliesCapacity : occupiedMembers,
      occupied: occupiedMembers,
      vacant: Math.max(0, totalHouses - occupiedMembers),
      registrationPlan: society.structureMeta,
    },
  };
}
