import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    fullName: string;
}, {
    email: string;
    password: string;
    fullName: string;
}>;
export declare const registerSocietySchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
    mobile: z.ZodOptional<z.ZodString>;
    society: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["APARTMENT_COMPLEX", "VILLA", "TOWNHOUSE", "OTHER"]>;
        address: z.ZodString;
        city: z.ZodString;
        pincode: z.ZodString;
        wings: z.ZodNumber;
        flats: z.ZodNumber;
        floors: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "APARTMENT_COMPLEX" | "VILLA" | "TOWNHOUSE" | "OTHER";
        name: string;
        address: string;
        city: string;
        pincode: string;
        wings: number;
        flats: number;
        floors: number;
    }, {
        type: "APARTMENT_COMPLEX" | "VILLA" | "TOWNHOUSE" | "OTHER";
        name: string;
        address: string;
        city: string;
        pincode: string;
        wings: number;
        flats: number;
        floors: number;
    }>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    fullName: string;
    society: {
        type: "APARTMENT_COMPLEX" | "VILLA" | "TOWNHOUSE" | "OTHER";
        name: string;
        address: string;
        city: string;
        pincode: string;
        wings: number;
        flats: number;
        floors: number;
    };
    mobile?: string | undefined;
}, {
    email: string;
    password: string;
    fullName: string;
    society: {
        type: "APARTMENT_COMPLEX" | "VILLA" | "TOWNHOUSE" | "OTHER";
        name: string;
        address: string;
        city: string;
        pincode: string;
        wings: number;
        flats: number;
        floors: number;
    };
    mobile?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterSocietyInput = z.infer<typeof registerSocietySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
//# sourceMappingURL=auth.validator.d.ts.map