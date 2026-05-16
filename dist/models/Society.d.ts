import { type Document, type Model } from "mongoose";
import { type SocietyType } from "../types/roles.js";
export type SocietyDocuments = {
    registrationCertificate?: string | null;
    panOrGst?: string | null;
};
export interface ISociety {
    name: string;
    type: SocietyType;
    address: string;
    city: string;
    pincode: string;
    wings: number;
    flats: number;
    floors: number;
    blocks: number;
    houses: number;
    documents: SocietyDocuments;
}
export interface ISocietyDocument extends ISociety, Document {
}
export declare const Society: Model<ISocietyDocument>;
//# sourceMappingURL=Society.d.ts.map