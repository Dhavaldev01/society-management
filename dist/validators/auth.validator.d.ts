import { z } from "zod";
import { SOCIETY_TYPES } from "../types/roles.js";
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
    mobile: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
    society: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        name: z.ZodString;
        address: z.ZodString;
        city: z.ZodString;
        pincode: z.ZodString;
        documents: z.ZodOptional<z.ZodObject<{
            registrationCertificate: z.ZodOptional<z.ZodString>;
            panOrGst: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            registrationCertificate?: string | undefined;
            panOrGst?: string | undefined;
        }, {
            registrationCertificate?: string | undefined;
            panOrGst?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"APARTMENT">;
        wings: z.ZodDefault<z.ZodNumber>;
        flats: z.ZodDefault<z.ZodNumber>;
        floors: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "APARTMENT";
        name: string;
        address: string;
        city: string;
        pincode: string;
        wings: number;
        flats: number;
        floors: number;
        documents?: {
            registrationCertificate?: string | undefined;
            panOrGst?: string | undefined;
        } | undefined;
    }, {
        type: "APARTMENT";
        name: string;
        address: string;
        city: string;
        pincode: string;
        documents?: {
            registrationCertificate?: string | undefined;
            panOrGst?: string | undefined;
        } | undefined;
        wings?: number | undefined;
        flats?: number | undefined;
        floors?: number | undefined;
    }>, z.ZodObject<{
        name: z.ZodString;
        address: z.ZodString;
        city: z.ZodString;
        pincode: z.ZodString;
        documents: z.ZodOptional<z.ZodObject<{
            registrationCertificate: z.ZodOptional<z.ZodString>;
            panOrGst: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            registrationCertificate?: string | undefined;
            panOrGst?: string | undefined;
        }, {
            registrationCertificate?: string | undefined;
            panOrGst?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"BLOCK_WISE">;
        blocks: z.ZodDefault<z.ZodNumber>;
        houses: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "BLOCK_WISE";
        name: string;
        address: string;
        city: string;
        pincode: string;
        blocks: number;
        houses: number;
        documents?: {
            registrationCertificate?: string | undefined;
            panOrGst?: string | undefined;
        } | undefined;
    }, {
        type: "BLOCK_WISE";
        name: string;
        address: string;
        city: string;
        pincode: string;
        documents?: {
            registrationCertificate?: string | undefined;
            panOrGst?: string | undefined;
        } | undefined;
        blocks?: number | undefined;
        houses?: number | undefined;
    }>]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    fullName: string;
    society: {
        type: "APARTMENT";
        name: string;
        address: string;
        city: string;
        pincode: string;
        wings: number;
        flats: number;
        floors: number;
        documents?: {
            registrationCertificate?: string | undefined;
            panOrGst?: string | undefined;
        } | undefined;
    } | {
        type: "BLOCK_WISE";
        name: string;
        address: string;
        city: string;
        pincode: string;
        blocks: number;
        houses: number;
        documents?: {
            registrationCertificate?: string | undefined;
            panOrGst?: string | undefined;
        } | undefined;
    };
    mobile?: string | undefined;
}, {
    email: string;
    password: string;
    fullName: string;
    society: {
        type: "APARTMENT";
        name: string;
        address: string;
        city: string;
        pincode: string;
        documents?: {
            registrationCertificate?: string | undefined;
            panOrGst?: string | undefined;
        } | undefined;
        wings?: number | undefined;
        flats?: number | undefined;
        floors?: number | undefined;
    } | {
        type: "BLOCK_WISE";
        name: string;
        address: string;
        city: string;
        pincode: string;
        documents?: {
            registrationCertificate?: string | undefined;
            panOrGst?: string | undefined;
        } | undefined;
        blocks?: number | undefined;
        houses?: number | undefined;
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
export { SOCIETY_TYPES };
//# sourceMappingURL=auth.validator.d.ts.map