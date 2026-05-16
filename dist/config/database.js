import mongoose from "mongoose";
import { env } from "./env.js";
export async function connectDatabase() {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.DATABASE_URL);
    console.log("MongoDB connected");
}
export async function disconnectDatabase() {
    await mongoose.disconnect();
}
//# sourceMappingURL=database.js.map