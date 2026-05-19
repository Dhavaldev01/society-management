import mongoose, { type Document, type Model, Schema, Types } from "mongoose";
import { SOCIETY_LAYOUT_TYPES, UNIT_STATUSES, type SocietyLayoutType, type UnitStatus } from "../types/roles.js";

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

const societyUnitSchema = new Schema<ISocietyUnit>(
  {
    name: { type: String, required: true, trim: true },
    totalHouses: { type: Number, default: 0, min: 0 },
    totalFamilies: { type: Number, default: 0, min: 0 },
    totalFloors: { type: Number, default: 0, min: 0 },
    description: { type: String, default: "", trim: true },
    status: { type: String, enum: UNIT_STATUSES, default: "ACTIVE" },
  },
  { timestamps: true },
);

const societySchema = new Schema<ISocietyDocument>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: "", trim: true },
    pincode: { type: String, required: true, trim: true },
    layoutType: { type: String, enum: SOCIETY_LAYOUT_TYPES, default: "APARTMENT" },
    structureMeta: {
      wings: { type: Number, default: 0 },
      flats: { type: Number, default: 0 },
      floors: { type: Number, default: 0 },
      blocks: { type: Number, default: 0 },
      houses: { type: Number, default: 0 },
    },
    units: { type: [societyUnitSchema], default: [] },
    documents: {
      registrationCertificate: { type: String, default: null },
      panOrGst: { type: String, default: null },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, collection: "societies" },
);

export const Society: Model<ISocietyDocument> =
  mongoose.models.Society ?? mongoose.model<ISocietyDocument>("Society", societySchema);
