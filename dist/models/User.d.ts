import { type Document, type Model } from "mongoose";
import { type Role } from "../types/roles.js";
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
export declare const User: Model<IUserDocument>;
//# sourceMappingURL=User.d.ts.map