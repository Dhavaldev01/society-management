import type { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  assignAdminSchema,
  createChangeRequestSchema,
  createMemberSchema,
  createUnitSchema,
  reviewChangeRequestSchema,
  updateUnitSchema,
} from "../validators/society.validator.js";
import * as societyOverviewService from "../services/societyOverview.service.js";
import * as societyUnitService from "../services/societyUnit.service.js";
import * as adminService from "../services/admin.service.js";
import * as memberService from "../services/member.service.js";
import * as changeRequestService from "../services/changeRequest.service.js";

function societyObjectId(req: Request) {
  const id = req.societyId ?? String(req.params.societyId ?? "");
  return new mongoose.Types.ObjectId(id);
}

function paramId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return String(value ?? "");
}

function userObjectId(req: Request) {
  return new mongoose.Types.ObjectId(req.user!.id);
}

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const overview = await societyOverviewService.getSocietyOverview(societyObjectId(req));
  res.json({ success: true, data: overview });
});

// —— Units (blocks/wings inside society document) ——
export const createUnit = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createUnitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const unit = await societyUnitService.createUnit(societyObjectId(req), userObjectId(req), parsed.data);
  res.status(201).json({ success: true, data: { unit } });
});

export const listUnits = asyncHandler(async (req: Request, res: Response) => {
  const units = await societyUnitService.listUnits(societyObjectId(req));
  res.json({ success: true, data: { units } });
});

export const updateUnit = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateUnitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const unit = await societyUnitService.updateUnit(
    societyObjectId(req),
    paramId(req.params.unitId),
    userObjectId(req),
    parsed.data,
  );
  res.json({ success: true, data: { unit } });
});

export const deleteUnit = asyncHandler(async (req: Request, res: Response) => {
  await societyUnitService.deleteUnit(
    societyObjectId(req),
    paramId(req.params.unitId),
    userObjectId(req),
  );
  res.json({ success: true, message: "Deleted successfully" });
});

// —— Admins ——
export const assignAdmin = asyncHandler(async (req: Request, res: Response) => {
  const parsed = assignAdminSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const user = await adminService.assignAdmin(societyObjectId(req), userObjectId(req), {
    ...parsed.data,
    phone: parsed.data.phone || undefined,
    unitId: parsed.data.unitId ?? null,
  });
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    },
  });
});

export const listAdmins = asyncHandler(async (req: Request, res: Response) => {
  const admins = await adminService.listAdmins(societyObjectId(req));
  res.json({ success: true, data: { admins } });
});

// —— Members ——
export const createMember = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const result = await memberService.createMemberPending(societyObjectId(req), userObjectId(req), {
    ...parsed.data,
    phone: parsed.data.phone || undefined,
    unitId: parsed.data.unitId ?? null,
  });
  res.status(201).json({
    success: true,
    message: "Member created and pending super admin approval",
    data: {
      memberId: result.member._id.toString(),
      userId: result.user._id.toString(),
      status: result.member.status,
    },
  });
});

export const listPendingMembers = asyncHandler(async (req: Request, res: Response) => {
  const members = await memberService.listPendingMembers(societyObjectId(req));
  res.json({ success: true, data: { members } });
});

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  const members = await memberService.listActiveMembers(societyObjectId(req));
  res.json({ success: true, data: { members } });
});

export const approveMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await memberService.approveMember(
    societyObjectId(req),
    paramId(req.params.memberId),
    userObjectId(req),
  );
  res.json({ success: true, data: { member }, message: "Member approved and can now login" });
});

export const rejectMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await memberService.rejectMember(
    societyObjectId(req),
    paramId(req.params.memberId),
    userObjectId(req),
  );
  res.json({ success: true, data: { member } });
});

// —— Change requests ——
export const submitChangeRequest = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createChangeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const request = await changeRequestService.submitChangeRequest(
    societyObjectId(req),
    userObjectId(req),
    parsed.data,
  );
  res.status(201).json({ success: true, data: { request } });
});

export const listChangeRequests = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as "PENDING" | "APPROVED" | "REJECTED" | undefined;
  const requests = await changeRequestService.listChangeRequests(societyObjectId(req), status);
  res.json({ success: true, data: { requests } });
});

export const reviewChangeRequest = asyncHandler(async (req: Request, res: Response) => {
  const parsed = reviewChangeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }
  const request = await changeRequestService.reviewChangeRequest(
    societyObjectId(req),
    paramId(req.params.requestId),
    userObjectId(req),
    parsed.data.action,
  );
  res.json({ success: true, data: { request } });
});
