import type { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as propertyService from "../services/property.service.js";
import * as propertyViewService from "../services/propertyView.service.js";
import * as propertyHistoryService from "../services/propertyHistory.service.js";

function societyObjectId(req: Request) {
  return new mongoose.Types.ObjectId(req.societyId ?? String(req.params.societyId ?? ""));
}

function paramId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return String(value ?? "");
}

export const listProperties = asyncHandler(async (req: Request, res: Response) => {
  const unitId = typeof req.query.unitId === "string" ? req.query.unitId : undefined;
  const properties = await propertyService.listProperties(societyObjectId(req), unitId);
  res.json({ success: true, data: { properties } });
});

export const getProperty = asyncHandler(async (req: Request, res: Response) => {
  const property = await propertyService.getPropertyById(
    societyObjectId(req),
    paramId(req.params.propertyId),
  );
  res.json({ success: true, data: { property } });
});

export const getPropertyView = asyncHandler(async (req: Request, res: Response) => {
  const view = await propertyViewService.getPropertyView(
    societyObjectId(req),
    paramId(req.params.propertyId),
  );
  res.json({ success: true, data: view });
});

export const getPropertyResidents = asyncHandler(async (req: Request, res: Response) => {
  const residents = await propertyViewService.listResidentFamilies(
    societyObjectId(req),
    paramId(req.params.propertyId),
  );
  res.json({ success: true, data: { residents } });
});

export const getPropertyHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await propertyHistoryService.listPropertyHistory(
    societyObjectId(req),
    paramId(req.params.propertyId),
  );
  res.json({ success: true, data: { history } });
});
