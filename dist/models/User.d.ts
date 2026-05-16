import { type Document, type Model, Types } from "mongoose";
import { type Role } from "../types/roles.js";
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
export declare const User: Model<IUserDocument>;
//# sourceMappingURL=User.d.ts.map