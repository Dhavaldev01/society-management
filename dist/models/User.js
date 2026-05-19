import mongoose, { Schema } from "mongoose";
import { ROLES } from "../types/roles.js";
const userSchema = new Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: null, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true },
    isActive: { type: Boolean, default: false },
}, { timestamps: true, collection: "users" });
export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
//# sourceMappingURL=User.js.map