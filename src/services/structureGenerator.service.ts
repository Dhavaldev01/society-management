import type { ClientSession, Types } from "mongoose";
import { Property, Society, type ISocietyDocument } from "../models/index.js";
import { httpError } from "../utils/httpError.js";

export const MAX_AUTO_PROPERTIES = 500;

function wingLabel(index: number): string {
  return `Wing - ${String.fromCharCode(64 + index)}`;
}

function blockLabel(index: number): string {
  return `Block - ${String(index).padStart(2, "0")}`;
}

function apartmentPropertyNumber(wingLetter: string, floor: number, flat: number): string {
  return `${wingLetter}-${floor}${String(flat).padStart(2, "0")}`;
}

export async function generateUnitsAndProperties(
  society: ISocietyDocument,
  session?: ClientSession,
): Promise<{ unitCount: number; propertyCount: number }> {
  const meta = society.structureMeta;
  const propertyRows: {
    societyId: Types.ObjectId;
    unitId: Types.ObjectId;
    propertyNumber: string;
    floorNumber: number;
  }[] = [];

  if (society.layoutType === "APARTMENT") {
    const wings = Math.max(0, meta.wings);
    const floors = Math.max(0, meta.floors);
    const flatsPerFloor = Math.max(0, meta.flatsPerFloor || meta.flats);

    for (let w = 1; w <= wings; w += 1) {
      const wingLetter = String.fromCharCode(64 + w);
      const unitName = wingLabel(w);
      const totalHouses = floors * flatsPerFloor;

      society.units.push({
        name: unitName,
        totalHouses,
        totalFamilies: 0,
        totalFloors: floors,
        description: "",
        status: "ACTIVE",
      } as never);

      const unit = society.units[society.units.length - 1]!;
      for (let f = 1; f <= floors; f += 1) {
        for (let flat = 1; flat <= flatsPerFloor; flat += 1) {
          if (propertyRows.length >= MAX_AUTO_PROPERTIES) {
            throw httpError(`Cannot auto-create more than ${MAX_AUTO_PROPERTIES} properties`, 400);
          }
          propertyRows.push({
            societyId: society._id,
            unitId: unit._id,
            propertyNumber: apartmentPropertyNumber(wingLetter, f, flat),
            floorNumber: f,
          });
        }
      }
    }
  } else {
    const blocks = Math.max(0, meta.blocks);
    const housesPerBlock = Math.max(0, meta.housesPerBlock || meta.houses);

    for (let b = 1; b <= blocks; b += 1) {
      const unitName = blockLabel(b);
      society.units.push({
        name: unitName,
        totalHouses: housesPerBlock,
        totalFamilies: 0,
        totalFloors: 0,
        description: "",
        status: "ACTIVE",
      } as never);

      const unit = society.units[society.units.length - 1]!;
      for (let h = 1; h <= housesPerBlock; h += 1) {
        if (propertyRows.length >= MAX_AUTO_PROPERTIES) {
          throw httpError(`Cannot auto-create more than ${MAX_AUTO_PROPERTIES} properties`, 400);
        }
        propertyRows.push({
          societyId: society._id,
          unitId: unit._id,
          propertyNumber: `H-${b}-${h}`,
          floorNumber: 0,
        });
      }
    }
  }

  await society.save(session ? { session } : undefined);

  if (propertyRows.length > 0) {
    if (session) {
      await Property.insertMany(propertyRows, { session });
    } else {
      await Property.insertMany(propertyRows);
    }
  }

  return { unitCount: society.units.length, propertyCount: propertyRows.length };
}
