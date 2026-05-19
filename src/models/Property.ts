import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export const PROPERTY_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export interface IProperty {
  societyId: Types.ObjectId;
  unitId: Types.ObjectId;
  propertyNumber: string;
  floorNumber: number;
  status: PropertyStatus;
}

export interface IPropertyDocument extends IProperty, Document {
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IPropertyDocument>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    unitId: { type: Schema.Types.ObjectId, required: true, index: true },
    propertyNumber: { type: String, required: true, trim: true },
    floorNumber: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: PROPERTY_STATUSES, default: "ACTIVE" },
  },
  { timestamps: true, collection: "properties" },
);

propertySchema.index({ societyId: 1, propertyNumber: 1 }, { unique: true });
propertySchema.index({ societyId: 1, unitId: 1 });

export const Property: Model<IPropertyDocument> =
  mongoose.models.Property ?? mongoose.model<IPropertyDocument>("Property", propertySchema);
