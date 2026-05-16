import mongoose, { type Document, type Model, Schema } from "mongoose";
import { SOCIETY_TYPES, type SocietyType } from "../types/roles.js";

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

export interface ISocietyDocument extends ISociety, Document {}

const societySchema = new Schema<ISocietyDocument>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: SOCIETY_TYPES, default: "APARTMENT_COMPLEX" },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    wings: { type: Number, default: 0 },
    flats: { type: Number, default: 0 },
    floors: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "societies",
  },
);

export const Society: Model<ISocietyDocument> =
  mongoose.models.Society ?? mongoose.model<ISocietyDocument>("Society", societySchema);
