import type { Role } from "./roles.js";

/** Roles returned to the mobile app (UI unchanged). */
export type ClientRole = "SUPER_ADMIN" | "ADMIN" | "RESIDENT" | "SECURITY";

export function toClientRole(role: Role): ClientRole {
  if (role === "MEMBER") return "RESIDENT";
  if (role === "SUPER_ADMIN" || role === "ADMIN") return role;
  return "RESIDENT";
}
