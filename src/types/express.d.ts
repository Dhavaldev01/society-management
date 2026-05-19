import type { Role } from "./roles.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
      };
      societyId?: string;
    }
  }
}

export {};
