import { z } from "zod";
import { RESIDENCY_ROLES } from "../types/societyMember.js";
import { OWNERSHIP_TYPES } from "../types/roles.js";

const familyMemberSchema = z.object({
  name: z.string().min(1),
  relation: z.string().min(1),
  age: z.union([z.coerce.number().int().min(0), z.literal("")]).optional(),
  gender: z.string().optional(),
});

const vehicleSchema = z.object({
  type: z.string().optional(),
  number: z.string().optional(),
  brand: z.string().optional(),
  parkingSlot: z.string().optional(),
});

const propertyRefSchema = z.object({
  propertyId: z.string().optional(),
  unitId: z.string().min(1),
  flatNumber: z.string().min(1),
  floorNumber: z.coerce.number().int().min(0).default(0),
});

export const completeSuperAdminResidencySchema = z.object({
  residentType: z.enum(RESIDENCY_ROLES),
  property: propertyRefSchema,
  isResident: z.boolean().default(true),
  isPrimaryOwner: z.boolean().default(true),
  ownerMemberId: z.string().optional().nullable(),
  rentalStart: z.string().optional(),
  rentalEnd: z.string().optional(),
  familyName: z.string().max(80).optional().nullable(),
  familyMembers: z.array(familyMemberSchema).default([]),
  vehicles: z.array(vehicleSchema).default([]),
});

export const completeResidentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.union([z.string().min(10).max(15), z.literal("")]).optional(),
  residentType: z.enum(OWNERSHIP_TYPES),
  accountKind: z.enum(["ADMIN", "MEMBER", "OWNER_ONLY"]),
  property: propertyRefSchema,
  isResident: z.boolean(),
  isPrimaryOwner: z.boolean().default(false),
  ownerMemberId: z.string().optional().nullable(),
  rentalStart: z.string().optional(),
  rentalEnd: z.string().optional(),
  familyName: z.string().max(80).optional().nullable(),
  familyMembers: z.array(familyMemberSchema).default([]),
  vehicles: z.array(vehicleSchema).default([]),
});

export type CompleteSuperAdminResidencyInput = z.infer<typeof completeSuperAdminResidencySchema>;
export type CompleteResidentInput = z.infer<typeof completeResidentSchema>;
