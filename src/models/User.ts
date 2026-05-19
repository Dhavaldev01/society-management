import mongoose, { type Document, type Model, Schema } from "mongoose";
import { ROLES, type Role } from "../types/roles.js";

export interface IUser {
  fullName: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  role: Role;
  isActive: boolean;
}

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: null, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "users" },
);

export const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>("User", userSchema);
