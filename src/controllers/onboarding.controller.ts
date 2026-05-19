import type { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assignResidencySchema } from "../validators/onboarding.validator.js";
import * as residencyService from "../services/societyMemberResidency.service.js";

function societyObjectId(req: Request) {
  return new mongoose.Types.ObjectId(req.societyId ?? String(req.params.societyId ?? ""));
}

function userObjectId(req: Request) {
  return new mongoose.Types.ObjectId(req.user!.id);
}

export const getOnboardingStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = await residencyService.getOnboardingStatus(societyObjectId(req), userObjectId(req));
  res.json({ success: true, data: status });
});

export const skipResidency = asyncHandler(async (req: Request, res: Response) => {
  const status = await residencyService.skipResidencySetup(societyObjectId(req), userObjectId(req));
  res.json({ success: true, data: status });
});

export const assignResidency = asyncHandler(async (req: Request, res: Response) => {
  const parsed = assignResidencySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const status = await residencyService.assignResidency(
    societyObjectId(req),
    userObjectId(req),
    parsed.data,
  );
  res.json({ success: true, data: status });
});
