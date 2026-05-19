export const ROLES = ["SUPER_ADMIN", "ADMIN", "MEMBER"] as const;
export type Role = (typeof ROLES)[number];

export const MEMBER_STATUSES = ["PENDING", "ACTIVE", "REJECTED"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const OWNERSHIP_TYPES = ["OWNER", "TENANT"] as const;
export type OwnershipType = (typeof OWNERSHIP_TYPES)[number];

export const UNIT_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type UnitStatus = (typeof UNIT_STATUSES)[number];

export const SOCIETY_LAYOUT_TYPES = ["APARTMENT", "BLOCK_WISE"] as const;
export type SocietyLayoutType = (typeof SOCIETY_LAYOUT_TYPES)[number];
