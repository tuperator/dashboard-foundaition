export const USER_STATUS_VALUES = ["WORKING", "ONLEAVE", "RESIGNED"] as const;
export type UserStatus = (typeof USER_STATUS_VALUES)[number];

export const GENDER_VALUES = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = (typeof GENDER_VALUES)[number];

export const USER_UNKNOWN_GENDER_VALUE = "UNKNOWN" as const;
export type UserUnknownGender = typeof USER_UNKNOWN_GENDER_VALUE;

export const BRANCH_STATUS_VALUES = ["ACTIVE", "INACTIVE"] as const;
export type BranchStatus = (typeof BRANCH_STATUS_VALUES)[number];

export const USER_FILTER_ALL_VALUE = "ALL" as const;
export type UserFilterAll = typeof USER_FILTER_ALL_VALUE;

export const USER_TWO_FACTOR_FILTER_VALUES = [
  "ALL",
  "ENABLED",
  "DISABLED",
] as const;
export type UserTwoFactorFilter = (typeof USER_TWO_FACTOR_FILTER_VALUES)[number];

export const USER_UNASSIGNED_BRANCH_VALUE = "UNASSIGNED" as const;
export type UserUnassignedBranch = typeof USER_UNASSIGNED_BRANCH_VALUE;

export type UserStatusFilter = UserFilterAll | UserStatus;

export type UserRole = {
  id: string;
  roleName: string;
};

export type Branch = {
  id: string;
  name: string;
  address: string | null;
  companyId: string | null;
  status: BranchStatus;
};

export type UserAccount = {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  address: string | null;
  companyId: string | null;
  branchId: string | null;
  status: UserStatus;
  gender: Gender | null;
  createdAt: string;
  updatedAt: string | null;
  joinedAt: string;
  lastLogin: string | null;
  avatarUrl: string | null;
  roles: UserRole[];
  twoFactorEnabled: boolean;
};

export type UserListFilters = {
  page: number;
  pageSize: number;
  search: string;
  role: string;
  status: UserStatusFilter;
  twoFactor: UserTwoFactorFilter;
};

export type PaginatedResult<TData> = {
  items: TData[];
  total: number;
  page: number;
  pageSize: number;
};

export type UpdateUserProfilePayload = {
  username: string;
  email: string;
  phone: string;
  address: string;
  gender: Gender | null;
  branchId: string | null;
  roleIds: string[];
};

export type CreateUserPayload = {
  username: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  gender: Gender | null;
  status: UserStatus;
  roleIds: string[];
  branchId: string | null;
  twoFactorEnabled: boolean;
};

export type UpdateUserPasswordPayload = {
  newPassword: string;
};
