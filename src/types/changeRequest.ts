export const CHANGE_TARGET_TYPES = ["USER", "MEMBER", "UNIT"] as const;
export type ChangeTargetType = (typeof CHANGE_TARGET_TYPES)[number];

export const CHANGE_REQUEST_TYPES = [
  "CREATE_MEMBER",
  "UPDATE_MEMBER",
  "CHANGE_UNIT",
  "CHANGE_OWNERSHIP",
  "UPDATE_USER",
] as const;
export type ChangeRequestType = (typeof CHANGE_REQUEST_TYPES)[number];

export const CHANGE_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ChangeStatus = (typeof CHANGE_STATUSES)[number];
