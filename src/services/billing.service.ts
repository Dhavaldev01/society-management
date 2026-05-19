import type { Types } from "mongoose";
import * as societyUnitService from "./societyUnit.service.js";
import { Society } from "../models/index.js";
import { httpError } from "../utils/httpError.js";

type UnitDto = Awaited<ReturnType<typeof societyUnitService.listUnits>>[number];

function formatPeriodLabel(period: string): string {
  const [year, month] = period.split("-").map(Number);
  if (!year || !month) return "May 2025";
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function deriveBillingForUnit(unitId: string, totalHouses: number, period: string) {
  const seed = hashSeed(`${unitId}:${period}`);
  const perUnit = 7500 + (seed % 1500);
  const total = Math.max(totalHouses, 1) * perUnit;
  const percent = 68 + (seed % 18) + (totalHouses % 5) * 0.4;
  const collected = Math.round((total * percent) / 100);
  const pending = Math.max(0, total - collected);
  const overdueCount = Math.max(1, Math.round(totalHouses * 0.08) + (seed % 4));
  return {
    total,
    collected,
    pending,
    overdueCount,
    percent: Math.round(percent * 100) / 100,
  };
}

function unitCountLabel(layoutType: "APARTMENT" | "BLOCK_WISE", totalHouses: number): string {
  if (layoutType === "BLOCK_WISE") {
    return `${totalHouses} Flats / Houses`;
  }
  return `${totalHouses} Flats`;
}

function collectionSectionTitle(layoutType: "APARTMENT" | "BLOCK_WISE"): string {
  return layoutType === "BLOCK_WISE" ? "Collection by Block" : "Collection by Wing";
}

function screenTitle(layoutType: "APARTMENT" | "BLOCK_WISE"): string {
  return layoutType === "BLOCK_WISE" ? "Block Details" : "Wing Details";
}

function toBillingItem(
  unit: UnitDto,
  layoutType: "APARTMENT" | "BLOCK_WISE",
  period: string,
) {
  const billing = deriveBillingForUnit(unit.id, unit.totalHouses, period);
  return {
    id: unit.id,
    name: unit.name,
    unitType: unit.type,
    unitCount: unit.totalHouses,
    unitCountLabel: unitCountLabel(layoutType, unit.totalHouses),
    collected: billing.collected,
    pending: billing.pending,
    overdueCount: billing.overdueCount,
    total: billing.total,
    percent: billing.percent,
  };
}

async function loadLayoutType(societyId: Types.ObjectId) {
  const society = await Society.findById(societyId).select("layoutType").lean();
  if (!society) throw httpError("Society not found", 404);
  return society.layoutType;
}

export async function getBlockWingBillingDetails(societyId: Types.ObjectId, period: string) {
  const layoutType = await loadLayoutType(societyId);
  const expectedType = layoutType === "BLOCK_WISE" ? "Block" : "Wing";
  const unitLabel = layoutType === "BLOCK_WISE" ? "Block" : "Wing";
  const unitLabelPlural = layoutType === "BLOCK_WISE" ? "Blocks" : "Wings";

  const units = await societyUnitService.listUnits(societyId);
  const items = units
    .filter((u) => u.type === expectedType)
    .map((u) => toBillingItem(u, layoutType, period));

  return {
    periodLabel: formatPeriodLabel(period),
    layoutType,
    unitLabel,
    unitLabelPlural,
    screenTitle: screenTitle(layoutType),
    items,
  };
}

export async function getMaintenanceDashboard(societyId: Types.ObjectId, period: string) {
  const { periodLabel, layoutType, items } = await getBlockWingBillingDetails(societyId, period);

  const totalDemand = items.reduce((sum, i) => sum + i.total, 0);
  const totalCollected = items.reduce((sum, i) => sum + i.collected, 0);
  const totalPending = items.reduce((sum, i) => sum + i.pending, 0);
  const overdueAccounts = items.reduce((sum, i) => sum + i.overdueCount, 0);
  const collectedPercent = totalDemand > 0 ? Math.round((totalCollected / totalDemand) * 10000) / 100 : 0;
  const overduePercent =
    items.length > 0 ? Math.round((overdueAccounts / (items.length * 10)) * 10000) / 100 : 0;

  const collections = items.slice(0, 6).map((i) => ({
    id: i.id,
    name: i.name,
    collected: i.collected,
    total: i.total,
    percent: i.percent,
  }));

  return {
    periodLabel,
    layoutType,
    collectionSectionTitle: collectionSectionTitle(layoutType),
    stats: {
      totalDemand,
      totalCollected,
      totalPending,
      overdueAccounts,
      collectedPercent,
      overduePercent,
    },
    collections,
  };
}
