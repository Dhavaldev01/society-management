import mongoose, { type Document, type Model, Schema, Types } from "mongoose";
import { ROLES, type Role } from "../types/roles.js";

export interface IUser {
  email: string;
  password: string;
  fullName: string;
  mobile: string | null;
  role: Role;
  societyId: Types.ObjectId | null;
}

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    mobile: { type: String, default: null, trim: true },
    role: { type: String, enum: ROLES, default: "RESIDENT" },
    societyId: { type: Schema.Types.ObjectId, ref: "Society", default: null },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

export const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>("User", userSchema);
