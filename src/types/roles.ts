export const ROLES = ["SUPER_ADMIN", "ADMIN", "RESIDENT", "SECURITY"] as const;
export type Role = (typeof ROLES)[number];

export const SOCIETY_TYPES = ["APARTMENT_COMPLEX", "VILLA", "TOWNHOUSE", "OTHER"] as const;
export type SocietyType = (typeof SOCIETY_TYPES)[number];
