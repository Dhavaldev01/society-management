import { type Document, type Model, Types } from "mongoose";
import { type SocietyLayoutType, type UnitStatus } from "../types/roles.js";
export type SocietyDocuments = {
    registrationCertificate?: string | null;
    panOrGst?: string | null;
};
/** Block or wing — embedded in `societies.units[]` (no separate collection). */
export type ISocietyUnit = {
    _id: Types.ObjectId;
    name: string;
    totalHouses: number;
    totalFamilies: number;
    totalFloors: number;
    description: string;
    status: UnitStatus;
    createdAt?: Date;
    updatedAt?: Date;
};
export interface ISociety {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    layoutType: SocietyLayoutType;
    /** Planned counts from registration (apartment: wings/flats/floors, block: blocks/houses). */
    structureMeta: {
        wings: number;
        flats: number;
        floors: number;
        blocks: number;
        houses: number;
    };
    /** Actual blocks/wings created by super admin. */
    units: Types.DocumentArray<ISocietyUnit>;
    documents: SocietyDocuments;
    createdBy: Types.ObjectId;
}
export interface ISocietyDocument extends ISociety, Document {
    createdAt: Date;
    updatedAt: Date;
}
export declare const Society: Model<ISocietyDocument>;
//# sourceMappingURL=Society.d.ts.map