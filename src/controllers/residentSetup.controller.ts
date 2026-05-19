import type { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  completeResidentSchema,
  completeSuperAdminResidencySchema,
} from "../validators/residentSetup.validator.js";
import * as residentSetupService from "../services/residentSetup.service.js";
import * as propertyService from "../services/property.service.js";

function societyObjectId(req: Request) {
  return new mongoose.Types.ObjectId(req.societyId ?? String(req.params.societyId ?? ""));
}

function userObjectId(req: Request) {
  return new mongoose.Types.ObjectId(req.user!.id);
}

export const getFlowStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = await residentSetupService.getResidencyFlowStatus(
    societyObjectId(req),
    userObjectId(req),
  );
  res.json({ success: true, data: status });
});

export const completeSuperAdminResidency = asyncHandler(async (req: Request, res: Response) => {
  const parsed = completeSuperAdminResidencySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const status = await residentSetupService.completeSuperAdminResidency(
    societyObjectId(req),
    userObjectId(req),
    parsed.data,
  );
  res.json({ success: true, data: status });
});

export const completeResident = asyncHandler(async (req: Request, res: Response) => {
  const parsed = completeResidentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const result = await residentSetupService.completeResidentRegistration(
    societyObjectId(req),
    userObjectId(req),
    parsed.data,
  );
  res.status(201).json({ success: true, data: result });
});

export const searchProperties = asyncHandler(async (req: Request, res: Response) => {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const unitId = typeof req.query.unitId === "string" ? req.query.unitId : undefined;
  const properties = await propertyService.searchProperties(societyObjectId(req), q, unitId);
  res.json({ success: true, data: { properties } });
});
