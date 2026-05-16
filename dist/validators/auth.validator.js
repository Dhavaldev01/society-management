import { z } from "zod";
import { SOCIETY_TYPES } from "../types/roles.js";
export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().min(2),
});
export const registerSocietySchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().min(2),
    mobile: z.string().min(10).max(15).optional(),
    society: z.object({
        name: z.string().min(2),
        type: z.enum(SOCIETY_TYPES),
        address: z.string().min(5),
        city: z.string().min(2),
        pincode: z.string().min(4).max(10),
        wings: z.coerce.number().int().min(0),
        flats: z.coerce.number().int().min(0),
        floors: z.coerce.number().int().min(0),
    }),
});
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
//# sourceMappingURL=auth.validator.js.map