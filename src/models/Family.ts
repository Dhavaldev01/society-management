import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IFamily {
  societyId: Types.ObjectId;
  propertyId: Types.ObjectId;
  societyMemberId: Types.ObjectId;
  familyName: string | null;
}

export interface IFamilyDocument extends IFamily, Document {
  createdAt: Date;
  updatedAt: Date;
}

const familySchema = new Schema<IFamilyDocument>(
  {
    societyId: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    societyMemberId: { type: Schema.Types.ObjectId, ref: "SocietyMember", required: true, unique: true },
    familyName: { type: String, default: null, trim: true },
  },
  { timestamps: true, collection: "families" },
);

export const Family: Model<IFamilyDocument> =
  mongoose.models.Family ?? mongoose.model<IFamilyDocument>("Family", familySchema);
