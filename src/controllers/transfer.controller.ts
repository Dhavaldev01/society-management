import type { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { transferOwnerSchema, transferTenantSchema } from "../validators/onboarding.validator.js";
import { transferOwner } from "../services/transfer/transferOwner.service.js";
import { transferTenant } from "../services/transfer/transferTenant.service.js";
import { addOwner } from "../services/memberOwner.service.js";
import { addTenant } from "../services/memberTenant.service.js";
import { addOwnerSchema, addTenantSchema } from "../validators/onboarding.validator.js";

function societyObjectId(req: Request) {
  return new mongoose.Types.ObjectId(req.societyId ?? String(req.params.societyId ?? ""));
}

function userObjectId(req: Request) {
  return new mongoose.Types.ObjectId(req.user!.id);
}

export const postAddOwner = asyncHandler(async (req: Request, res: Response) => {
  const parsed = addOwnerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const result = await addOwner(societyObjectId(req), userObjectId(req), {
    ...parsed.data,
    phone: parsed.data.phone || undefined,
  });
  res.status(201).json({
    success: true,
    data: {
      memberId: result.member._id.toString(),
      userId: result.user._id.toString(),
    },
  });
});

export const postAddTenant = asyncHandler(async (req: Request, res: Response) => {
  const parsed = addTenantSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const result = await addTenant(societyObjectId(req), userObjectId(req), {
    ...parsed.data,
    phone: parsed.data.phone || undefined,
  });
  res.status(201).json({
    success: true,
    data: {
      memberId: result.member._id.toString(),
      userId: result.user._id.toString(),
    },
  });
});

export const postTransferTenant = asyncHandler(async (req: Request, res: Response) => {
  const parsed = transferTenantSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const member = await transferTenant(societyObjectId(req), userObjectId(req), parsed.data);
  res.json({ success: true, data: { memberId: member._id.toString() } });
});

export const postTransferOwner = asyncHandler(async (req: Request, res: Response) => {
  const parsed = transferOwnerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const member = await transferOwner(societyObjectId(req), userObjectId(req), parsed.data);
  res.json({ success: true, data: { memberId: member._id.toString() } });
});
