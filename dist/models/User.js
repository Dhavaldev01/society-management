import mongoose, { Schema } from "mongoose";
import { ROLES } from "../types/roles.js";
const userSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    mobile: { type: String, default: null, trim: true },
    role: { type: String, enum: ROLES, default: "RESIDENT" },
    societyId: { type: Schema.Types.ObjectId, ref: "Society", default: null },
}, {
    timestamps: true,
    collection: "users",
});
export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
//# sourceMappingURL=User.js.map