import mongoose, { type Types } from "mongoose";
import { ChangeRequest, SocietyMember, User } from "../models/index.js";
import type { ChangeRequestType } from "../types/changeRequest.js";
import { httpError } from "../utils/httpError.js";
import { writeAuditLog } from "./audit.service.js";

export async function submitChangeRequest(
  societyId: Types.ObjectId,
  requestedBy: Types.ObjectId,
  input: {
    targetType: "USER" | "MEMBER" | "UNIT";
    targetId?: string | null;
    requestType: ChangeRequestType;
    newData: Record<string, unknown>;
  },
) {
  let oldData: Record<string, unknown> = {};

  if (input.targetId && input.targetType === "MEMBER") {
    const member = await SocietyMember.findOne({ _id: input.targetId, societyId }).lean();
    if (!member) throw httpError("Member not found", 404);
    oldData = {
      unitId: member.unitId?.toString() ?? null,
      flatNumber: member.flatNumber,
      floorNumber: member.floorNumber,
      ownershipType: member.ownershipType,
      status: member.status,
    };
  }

  if (input.targetId && input.targetType === "USER") {
    const user = await User.findById(input.targetId).select("fullName phone email").lean();
    if (!user) throw httpError("User not found", 404);
    oldData = { fullName: user.fullName, phone: user.phone, email: user.email };
  }

  const request = await ChangeRequest.create({
    societyId,
    requestedBy,
    targetType: input.targetType,
    targetId: input.targetId || null,
    requestType: input.requestType,
    oldData,
    newData: input.newData,
    status: "PENDING",
    approvedBy: null,
  });

  return request;
}

async function applyApprovedChange(request: {
  societyId: Types.ObjectId;
  targetType: string;
  targetId: Types.ObjectId | null;
  requestType: ChangeRequestType;
  newData: Record<string, unknown>;
}) {
  if (request.requestType === "UPDATE_MEMBER" && request.targetId) {
    const member = await SocietyMember.findOne({ _id: request.targetId, societyId: request.societyId });
    if (!member) throw httpError("Member not found", 404);
    if (request.newData.unitId !== undefined) {
      const unitId = request.newData.unitId as string | null;
      member.unitId =
        unitId && mongoose.isValidObjectId(unitId) ? new mongoose.Types.ObjectId(unitId) : null;
    }
    if (request.newData.flatNumber !== undefined) member.flatNumber = String(request.newData.flatNumber);
    if (request.newData.floorNumber !== undefined) member.floorNumber = Number(request.newData.floorNumber);
    if (request.newData.ownershipType !== undefined) {
      member.ownershipType = request.newData.ownershipType as "OWNER" | "TENANT";
    }
    await member.save();
    return;
  }

  if (request.requestType === "UPDATE_USER" && request.targetId) {
    const user = await User.findById(request.targetId);
    if (!user) throw httpError("User not found", 404);
    if (request.newData.fullName !== undefined) user.fullName = String(request.newData.fullName);
    if (request.newData.phone !== undefined) user.phone = String(request.newData.phone) || null;
    await user.save();
    return;
  }

  if (request.requestType === "CHANGE_OWNERSHIP" && request.targetId) {
    const member = await SocietyMember.findOne({ _id: request.targetId, societyId: request.societyId });
    if (!member) throw httpError("Member not found", 404);
    member.ownershipType = (request.newData.ownershipType as "OWNER" | "TENANT") ?? member.ownershipType;
    await member.save();
    return;
  }

  if (request.requestType === "CHANGE_UNIT" && request.targetId) {
    const member = await SocietyMember.findOne({ _id: request.targetId, societyId: request.societyId });
    if (!member) throw httpError("Member not found", 404);
    const unitId = request.newData.unitId as string | null;
    member.unitId =
      unitId && mongoose.isValidObjectId(unitId) ? new mongoose.Types.ObjectId(unitId) : null;
    await member.save();
  }
}

export async function listChangeRequests(societyId: Types.ObjectId, status?: "PENDING" | "APPROVED" | "REJECTED") {
  const filter: Record<string, unknown> = { societyId };
  if (status) filter.status = status;
  return ChangeRequest.find(filter).sort({ createdAt: -1 }).lean();
}

export async function reviewChangeRequest(
  societyId: Types.ObjectId,
  requestId: string,
  approvedBy: Types.ObjectId,
  action: "APPROVE" | "REJECT",
) {
  const request = await ChangeRequest.findOne({ _id: requestId, societyId });
  if (!request) throw httpError("Change request not found", 404);
  if (request.status !== "PENDING") throw httpError("Request already reviewed", 400);

  const before = { status: request.status };

  if (action === "REJECT") {
    request.status = "REJECTED";
    request.approvedBy = approvedBy;
    await request.save();
    await writeAuditLog({
      action: "CHANGE_REQUEST_REJECTED",
      performedBy: approvedBy,
      societyId,
      before,
      after: { requestId, status: "REJECTED" },
    });
    return request;
  }

  await applyApprovedChange(request);
  request.status = "APPROVED";
  request.approvedBy = approvedBy;
  await request.save();

  await writeAuditLog({
    action: "CHANGE_REQUEST_APPROVED",
    performedBy: approvedBy,
    societyId,
    before,
    after: { requestId, status: "APPROVED", requestType: request.requestType },
  });

  return request;
}
