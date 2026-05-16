import type { Role } from "../types/roles.js";
export type JwtPayload = {
    sub: string;
    email: string;
    role: Role;
};
export declare function signAccessToken(payload: JwtPayload): string;
export declare function verifyAccessToken(token: string): JwtPayload;
//# sourceMappingURL=jwt.d.ts.map