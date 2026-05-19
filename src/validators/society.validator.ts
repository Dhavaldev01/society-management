import { z } from "zod";
import { CHANGE_REQUEST_TYPES, CHANGE_TARGET_TYPES } from "../types/changeRequest.js";
import { OWNERSHIP_TYPES, UNIT_STATUSES } from "../types/roles.js";

export const createUnitSchema = z.object({
  name: z.string().min(1).max(80),
  totalHouses: z.coerce.number().int().min(0).default(0),
  totalFamilies: z.coerce.number().int().min(0).default(0),
  totalFloors: z.coerce.number().int().min(0).default(0),
  description: z.string().max(500).optional(),
  status: z.enum(UNIT_STATUSES).default("ACTIVE"),
});

export const updateUnitSchema = createUnitSchema.partial().refine((d) => Object.keys(d).length > 0, {
  message: "At least one field is required",
});

export const assignAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.union([z.string().min(10).max(15), z.literal("")]).optional(),
  unitId: z.string().optional().nullable(),
  flatNumber: z.string().optional(),
  floorNumber: z.coerce.number().int().min(0).default(0),
  ownershipType: z.enum(OWNERSHIP_TYPES).default("OWNER"),
});

export const createMemberSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.union([z.string().min(10).max(15), z.literal("")]).optional(),
  unitId: z.string().optional().nullable(),
  flatNumber: z.string().optional(),
  floorNumber: z.coerce.number().int().min(0).default(0),
  ownershipType: z.enum(OWNERSHIP_TYPES).default("OWNER"),
});

export const createChangeRequestSchema = z.object({
  targetType: z.enum(CHANGE_TARGET_TYPES),
  targetId: z.string().optional().nullable(),
  requestType: z.enum(CHANGE_REQUEST_TYPES),
  newData: z.record(z.unknown()),
});

export const reviewChangeRequestSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});
