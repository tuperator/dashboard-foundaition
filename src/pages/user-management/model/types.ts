export const USER_STATUS_VALUES = ["WORKING", "ONLEAVE", "RESIGNED"] as const;
export type UserStatus = (typeof USER_STATUS_VALUES)[number];

export const GENDER_VALUES = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = (typeof GENDER_VALUES)[number];

export type UserRole = {
  id: string;
  roleName: string;
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
  status: "ALL" | UserStatus;
  twoFactor: "ALL" | "ENABLED" | "DISABLED";
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
  phone: string | null;
  address: string | null;
  gender: Gender | null;
  status: UserStatus;
  roleIds: string[];
  twoFactorEnabled: boolean;
};

export type UpdateUserPasswordPayload = {
  newPassword: string;
};
