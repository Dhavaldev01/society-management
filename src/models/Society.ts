import mongoose, { type Document, type Model, Schema } from "mongoose";
import { SOCIETY_TYPES, type SocietyType } from "../types/roles.js";

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

export interface ISocietyDocument extends ISociety, Document {}

const documentsSchema = new Schema<SocietyDocuments>(
  {
    registrationCertificate: { type: String, default: null },
    panOrGst: { type: String, default: null },
  },
  { _id: false },
);

const societySchema = new Schema<ISocietyDocument>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: SOCIETY_TYPES, default: "APARTMENT" },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    wings: { type: Number, default: 0, min: 0 },
    flats: { type: Number, default: 0, min: 0 },
    floors: { type: Number, default: 0, min: 0 },
    blocks: { type: Number, default: 0, min: 0 },
    houses: { type: Number, default: 0, min: 0 },
    documents: { type: documentsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    collection: "societies",
  },
);

export const Society: Model<ISocietyDocument> =
  mongoose.models.Society ?? mongoose.model<ISocietyDocument>("Society", societySchema);
