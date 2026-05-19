export const SOCIETY_MEMBER_ROLES = ["ADMIN", "OWNER", "TENANT"] as const;
export type SocietyMemberRole = (typeof SOCIETY_MEMBER_ROLES)[number];

export const RESIDENCY_ROLES = ["OWNER", "TENANT"] as const;
export type ResidencyRole = (typeof RESIDENCY_ROLES)[number];
