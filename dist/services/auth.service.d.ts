import type { LoginInput, RegisterInput, RegisterSocietyInput } from "../validators/auth.validator.js";
import type { Role } from "../types/roles.js";
export type SafeUser = {
    id: string;
    email: string;
    fullName: string;
    mobile: string | null;
    role: Role;
    societyId: string | null;
    societyName: string | null;
    createdAt: Date;
};
export declare function registerUser(input: RegisterInput): Promise<{
    user: SafeUser;
    token: string;
}>;
export declare function registerSocietyAdmin(input: RegisterSocietyInput): Promise<{
    user: SafeUser;
    token: string;
}>;
export declare function loginUser(input: LoginInput): Promise<{
    user: SafeUser;
    token: string;
}>;
export declare function getUserById(id: string): Promise<SafeUser | null>;
//# sourceMappingURL=auth.service.d.ts.map