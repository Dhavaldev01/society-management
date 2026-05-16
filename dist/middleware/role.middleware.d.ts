import type { NextFunction, Request, Response } from "express";
import type { Role } from "../types/roles.js";
export declare function requireRoles(...allowed: Role[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=role.middleware.d.ts.map