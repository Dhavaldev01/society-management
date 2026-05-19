import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AdminAssignment, Society, SocietyMember } from "../models/index.js";

export async function requireSocietyAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  const societyId = String(req.params.societyId ?? "");
  if (!req.user?.id || !societyId || !mongoose.isValidObjectId(societyId)) {
    res.status(400).json({ success: false, message: "Invalid society" });
    return;
  }

  const society = await Society.findById(societyId).lean();
  if (!society) {
    res.status(404).json({ success: false, message: "Society not found" });
    return;
  }

  if (req.user.role === "SUPER_ADMIN" && society.createdBy.toString() === req.user.id) {
    req.societyId = societyId;
    next();
    return;
  }

  const membership = await SocietyMember.findOne({
    societyId,
    userId: req.user.id,
    status: "ACTIVE",
  }).lean();

  if (!membership) {
    res.status(403).json({ success: false, message: "No access to this society" });
    return;
  }

  if (req.user.role === "ADMIN") {
    const assignment = await AdminAssignment.findOne({
      societyId,
      userId: req.user.id,
      isActive: true,
    }).lean();
    if (!assignment) {
      res.status(403).json({ success: false, message: "Admin assignment required" });
      return;
    }
  }

  req.societyId = societyId;
  next();
}

export function requireSocietySuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== "SUPER_ADMIN") {
    res.status(403).json({ success: false, message: "Super admin only" });
    return;
  }
  next();
}
