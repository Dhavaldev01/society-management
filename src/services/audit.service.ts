import type { Types } from "mongoose";
import { AuditLog } from "../models/index.js";

export async function writeAuditLog(params: {
  action: string;
  performedBy: Types.ObjectId;
  societyId: Types.ObjectId;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}) {
  await AuditLog.create({
    action: params.action,
    performedBy: params.performedBy,
    societyId: params.societyId,
    before: params.before ?? {},
    after: params.after ?? {},
  });
}
