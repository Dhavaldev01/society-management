export const ROLES = ["SUPER_ADMIN", "ADMIN", "RESIDENT", "SECURITY"] as const;
export type Role = (typeof ROLES)[number];

/** Layout mode: apartment (wings/flats/floors) or block-wise (blocks/houses). */
export const SOCIETY_TYPES = ["APARTMENT", "BLOCK_WISE"] as const;
export type SocietyType = (typeof SOCIETY_TYPES)[number];
