import mongoose, { Schema } from "mongoose";
import { SOCIETY_TYPES } from "../types/roles.js";
const societySchema = new Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: SOCIETY_TYPES, default: "APARTMENT_COMPLEX" },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    wings: { type: Number, default: 0 },
    flats: { type: Number, default: 0 },
    floors: { type: Number, default: 0 },
}, {
    timestamps: true,
    collection: "societies",
});
export const Society = mongoose.models.Society ?? mongoose.model("Society", societySchema);
//# sourceMappingURL=Society.js.map