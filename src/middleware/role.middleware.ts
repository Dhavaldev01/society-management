import type { NextFunction, Request, Response } from "express";
import type { Role } from "../types/roles.js";

export function requireRoles(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!allowed.includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
      return;
    }

    next();
  };
}
