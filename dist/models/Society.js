import mongoose, { Schema } from "mongoose";
import { SOCIETY_LAYOUT_TYPES, UNIT_STATUSES } from "../types/roles.js";
const societyUnitSchema = new Schema({
    name: { type: String, required: true, trim: true },
    totalHouses: { type: Number, default: 0, min: 0 },
    totalFamilies: { type: Number, default: 0, min: 0 },
    totalFloors: { type: Number, default: 0, min: 0 },
    description: { type: String, default: "", trim: true },
    status: { type: String, enum: UNIT_STATUSES, default: "ACTIVE" },
}, { timestamps: true });
const societySchema = new Schema({
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
}, { timestamps: true, collection: "societies" });
export const Society = mongoose.models.Society ?? mongoose.model("Society", societySchema);
//# sourceMappingURL=Society.js.map