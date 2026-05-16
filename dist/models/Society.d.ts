import { type Document, type Model } from "mongoose";
import { type SocietyType } from "../types/roles.js";
export interface ISociety {
    name: string;
    type: SocietyType;
    address: string;
    city: string;
    pincode: string;
    wings: number;
    flats: number;
    floors: number;
}
export interface ISocietyDocument extends ISociety, Document {
}
export declare const Society: Model<ISocietyDocument>;
//# sourceMappingURL=Society.d.ts.map