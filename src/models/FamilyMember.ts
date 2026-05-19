import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IFamilyMember {
  familyId: Types.ObjectId;
  name: string;
  relation: string;
  age: number | null;
  gender: string | null;
}

export interface IFamilyMemberDocument extends IFamilyMember, Document {
  createdAt: Date;
  updatedAt: Date;
}

const familyMemberSchema = new Schema<IFamilyMemberDocument>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    name: { type: String, required: true, trim: true },
    relation: { type: String, required: true, trim: true },
    age: { type: Number, default: null, min: 0 },
    gender: { type: String, default: null, trim: true },
  },
  { timestamps: true, collection: "familyMembers" },
);

export const FamilyMember: Model<IFamilyMemberDocument> =
  mongoose.models.FamilyMember ??
  mongoose.model<IFamilyMemberDocument>("FamilyMember", familyMemberSchema);
