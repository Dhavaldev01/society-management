import type { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createFamilyMemberSchema,
  createFamilySchema,
} from "../validators/onboarding.validator.js";
import * as familyService from "../services/family.service.js";

function societyObjectId(req: Request) {
  return new mongoose.Types.ObjectId(req.societyId ?? String(req.params.societyId ?? ""));
}

function userObjectId(req: Request) {
  return new mongoose.Types.ObjectId(req.user!.id);
}

function paramId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return String(value ?? "");
}

export const createMyFamily = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createFamilySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const family = await familyService.createFamilyForCurrentUser(
    societyObjectId(req),
    userObjectId(req),
    parsed.data.familyName,
  );
  res.status(201).json({ success: true, data: { family } });
});

export const getMyFamily = asyncHandler(async (req: Request, res: Response) => {
  const family = await familyService.getMyFamily(societyObjectId(req), userObjectId(req));
  res.json({ success: true, data: { family } });
});

export const listFamiliesByProperty = asyncHandler(async (req: Request, res: Response) => {
  const propertyId = typeof req.query.propertyId === "string" ? req.query.propertyId : "";
  if (!propertyId) {
    res.status(400).json({ success: false, message: "propertyId query required" });
    return;
  }
  const families = await familyService.listFamiliesByProperty(societyObjectId(req), propertyId);
  res.json({ success: true, data: { families } });
});

export const addFamilyMember = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createFamilyMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const member = await familyService.addFamilyMember(
    societyObjectId(req),
    paramId(req.params.familyId),
    userObjectId(req),
    parsed.data,
  );
  res.status(201).json({
    success: true,
    data: {
      member: {
        id: member._id.toString(),
        name: member.name,
        relation: member.relation,
        age: member.age,
        gender: member.gender,
      },
    },
  });
});

export const deleteFamilyMember = asyncHandler(async (req: Request, res: Response) => {
  await familyService.deleteFamilyMember(
    societyObjectId(req),
    paramId(req.params.familyMemberId),
    userObjectId(req),
  );
  res.json({ success: true, message: "Deleted successfully" });
});
