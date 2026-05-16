import { z } from "zod";
import { SOCIETY_TYPES } from "../types/roles.js";

const optionalDocumentsSchema = z
  .object({
    registrationCertificate: z.string().trim().min(1).optional(),
    panOrGst: z.string().trim().min(1).optional(),
  })
  .optional();

const societyBaseSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  pincode: z.string().min(4).max(10),
  documents: optionalDocumentsSchema,
});

const apartmentSocietySchema = societyBaseSchema.extend({
  type: z.literal("APARTMENT"),
  wings: z.coerce.number().int().min(0).default(0),
  flats: z.coerce.number().int().min(0).default(0),
  floors: z.coerce.number().int().min(0).default(0),
});

const blockWiseSocietySchema = societyBaseSchema.extend({
  type: z.literal("BLOCK_WISE"),
  blocks: z.coerce.number().int().min(0).default(0),
  houses: z.coerce.number().int().min(0).default(0),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2),
});

export const registerSocietySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2),
  mobile: z.union([z.string().min(10).max(15), z.literal("")]).optional(),
  society: z.discriminatedUnion("type", [apartmentSocietySchema, blockWiseSocietySchema]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterSocietyInput = z.infer<typeof registerSocietySchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export { SOCIETY_TYPES };
