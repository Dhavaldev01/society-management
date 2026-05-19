import type { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as billingService from "../services/billing.service.js";
import type { MaintenanceDashboardQuery } from "../validators/billing.validator.js";

function societyObjectId(req: Request) {
  const id = req.societyId ?? String(req.params.societyId ?? "");
  return new mongoose.Types.ObjectId(id);
}

export const getMaintenanceDashboard = asyncHandler(async (req: Request, res: Response) => {
  const { period } = req.query as MaintenanceDashboardQuery;
  const dashboard = await billingService.getMaintenanceDashboard(societyObjectId(req), period);
  sendSuccess(res, dashboard);
});

export const getBlockWingBillingDetails = asyncHandler(async (req: Request, res: Response) => {
  const { period } = req.query as MaintenanceDashboardQuery;
  const details = await billingService.getBlockWingBillingDetails(societyObjectId(req), period);
  sendSuccess(res, details);
});
