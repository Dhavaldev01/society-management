import { z } from "zod";
import { RESIDENCY_ROLES } from "../types/societyMember.js";

export const assignResidencySchema = z.object({
  propertyId: z.string().min(1),
  societyRole: z.enum(RESIDENCY_ROLES),
});

export const addOwnerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.union([z.string().min(10).max(15), z.literal("")]).optional(),
  propertyId: z.string().min(1),
  isResident: z.boolean().default(false),
  isPrimaryOwner: z.boolean().default(true),
});

export const addTenantSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.union([z.string().min(10).max(15), z.literal("")]).optional(),
  propertyId: z.string().min(1),
});

export const createFamilySchema = z.object({
  familyName: z.string().max(80).optional().nullable(),
});

export const createFamilyMemberSchema = z.object({
  name: z.string().min(1).max(80),
  relation: z.string().min(1).max(40),
  age: z.coerce.number().int().min(0).optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
});

export const transferTenantSchema = z.object({
  societyMemberId: z.string().min(1),
  newPropertyId: z.string().min(1),
  moveFamily: z.boolean().default(true),
});

export const transferOwnerSchema = z.object({
  propertyId: z.string().min(1),
  newOwnerMemberId: z.string().min(1),
});
