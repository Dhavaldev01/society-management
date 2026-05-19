import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IVehicle {
  societyId: Types.ObjectId;
  societyMemberId: Types.ObjectId;
  type: string;
  number: string;
  brand: string;
  parkingSlot: string;
}

export interface IVehicleDocument extends IVehicle, Document {
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicleDocument>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    societyMemberId: { type: Schema.Types.ObjectId, ref: "SocietyMember", required: true, index: true },
    type: { type: String, default: "", trim: true },
    number: { type: String, default: "", trim: true },
    brand: { type: String, default: "", trim: true },
    parkingSlot: { type: String, default: "", trim: true },
  },
  { timestamps: true, collection: "vehicles" },
);

export const Vehicle: Model<IVehicleDocument> =
  mongoose.models.Vehicle ?? mongoose.model<IVehicleDocument>("Vehicle", vehicleSchema);
