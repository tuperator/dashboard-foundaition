import { mockBranches, mockRoles, mockUsersSeed } from "./mockUsers";
import type {
  Branch,
  CreateUserPayload,
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

export async function listBranches(): Promise<Branch[]> {
  await delay();
  return structuredClone(mockBranches);
}

export async function listUsers(
  filters: UserListFilters,
): Promise<PaginatedResult<UserAccount>> {
  await delay();

  const keyword = normalizeSearch(filters.search);

  let filtered = usersDb.filter((user) => {
    const branchText = user.branchIds
      .map((branchId) => mockBranches.find((branch) => branch.id === branchId)?.name || "")
      .join(" ")
      .toLowerCase();

    const matchedSearch =
      keyword.length === 0 ||
      user.username.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.phone?.toLowerCase().includes(keyword) ||
      branchText.includes(keyword);

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
  const normalizedBranchIds = normalizeBranchIds(payload.branchIds);

  usersDb[index] = {
    ...usersDb[index],
    username: payload.username,
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    gender: payload.gender,
    status: payload.status,
    roles: nextRoles,
    branchIds: normalizedBranchIds,
    branchId: normalizedBranchIds[0] || null,
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

export async function createUser(payload: CreateUserPayload) {
  await delay();

  if (payload.password.length < 8) {
    throw new Error("PASSWORD_POLICY_INVALID");
  }

  const emailExists = usersDb.some(
    (user) => user.email.toLowerCase() === payload.email.trim().toLowerCase(),
  );
  if (emailExists) {
    throw new Error("USER_EMAIL_EXISTS");
  }

  const nextRoles = mockRoles.filter((role) => payload.roleIds.includes(role.id));
  const normalizedBranchIds = normalizeBranchIds(payload.branchIds);
  const nowIso = new Date().toISOString();

  const nextUser: UserAccount = {
    id: crypto.randomUUID(),
    username: payload.username.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone,
    address: payload.address,
    companyId: "company-01",
    branchId: normalizedBranchIds[0] || null,
    branchIds: normalizedBranchIds,
    status: payload.status,
    gender: payload.gender,
    createdAt: nowIso,
    updatedAt: nowIso,
    joinedAt: nowIso,
    lastLogin: null,
    avatarUrl: null,
    roles: nextRoles,
    twoFactorEnabled: payload.twoFactorEnabled,
  };

  usersDb = [nextUser, ...usersDb];

  return structuredClone(nextUser);
}

function normalizeBranchIds(branchIds: string[]) {
  const branchSet = new Set(mockBranches.map((branch) => branch.id));
  const unique = [...new Set(branchIds)].filter((id) => branchSet.has(id));
  return unique;
}
