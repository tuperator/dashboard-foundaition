import { mockRoles, mockUsersSeed } from "./mockUsers";
import type {
  PaginatedResult,
  UpdateUserPasswordPayload,
  UpdateUserProfilePayload,
  UserAccount,
  UserListFilters,
  UserRole,
  UserStatus,
} from "./types";

const NETWORK_DELAY_MS = 180;

let usersDb: UserAccount[] = structuredClone(mockUsersSeed);

function delay(ms = NETWORK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export async function listUserRoles(): Promise<UserRole[]> {
  await delay();
  return structuredClone(mockRoles);
}

export async function listUsers(
  filters: UserListFilters,
): Promise<PaginatedResult<UserAccount>> {
  await delay();

  const keyword = normalizeSearch(filters.search);

  let filtered = usersDb.filter((user) => {
    const matchedSearch =
      keyword.length === 0 ||
      user.username.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.phone?.toLowerCase().includes(keyword);

    const matchedRole =
      filters.role === "ALL" ||
      user.roles.some((role) => role.id === filters.role);

    const matchedStatus =
      filters.status === "ALL" || user.status === filters.status;

    const matchedTwoFactor =
      filters.twoFactor === "ALL" ||
      (filters.twoFactor === "ENABLED" && user.twoFactorEnabled) ||
      (filters.twoFactor === "DISABLED" && !user.twoFactorEnabled);

    return matchedSearch && matchedRole && matchedStatus && matchedTwoFactor;
  });

  filtered = filtered.sort((a, b) => {
    const left = new Date(b.joinedAt).getTime();
    const right = new Date(a.joinedAt).getTime();
    return left - right;
  });

  const start = (filters.page - 1) * filters.pageSize;
  const end = start + filters.pageSize;

  return {
    items: structuredClone(filtered.slice(start, end)),
    total: filtered.length,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function updateUserProfile(
  userId: string,
  payload: UpdateUserProfilePayload,
) {
  await delay();

  const index = usersDb.findIndex((user) => user.id === userId);
  if (index < 0) {
    throw new Error("USER_NOT_FOUND");
  }

  const nextRoles = mockRoles.filter((role) => payload.roleIds.includes(role.id));

  usersDb[index] = {
    ...usersDb[index],
    username: payload.username,
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    gender: payload.gender,
    status: payload.status,
    roles: nextRoles,
    twoFactorEnabled: payload.twoFactorEnabled,
    updatedAt: new Date().toISOString(),
  };

  return structuredClone(usersDb[index]);
}

export async function updateUserPassword(
  userId: string,
  payload: UpdateUserPasswordPayload,
) {
  await delay();

  const user = usersDb.find((item) => item.id === userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (payload.newPassword.length < 8) {
    throw new Error("PASSWORD_POLICY_INVALID");
  }

  return {
    accountId: userId,
    updatedAt: new Date().toISOString(),
  };
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  await delay();

  const index = usersDb.findIndex((user) => user.id === userId);
  if (index < 0) {
    throw new Error("USER_NOT_FOUND");
  }

  usersDb[index] = {
    ...usersDb[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  return structuredClone(usersDb[index]);
}

export async function deleteUser(userId: string) {
  await delay();

  usersDb = usersDb.filter((user) => user.id !== userId);
  return { accountId: userId };
}
