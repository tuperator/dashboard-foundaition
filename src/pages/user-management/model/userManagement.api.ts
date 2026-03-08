import { API_ENDPOINTS } from "@/shared/api/endpoints";
import { listRoles as listRolesApi } from "@/shared/api/roles";
import { apiClient } from "@/shared/api/http";
import type { Branch, BranchStatus, CreateUserPayload, PaginatedResult, UpdateUserPasswordPayload, UpdateUserProfilePayload, UserAccount, UserListFilters, UserRole, UserStatus } from "./types";
import { USER_FILTER_ALL } from "./constants";

type BackendUserRole = {
  id: string;
  roleName: string;
};

type BackendUserItem = {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  address: string | null;
  companyId: string | null;
  branchId: string | null;
  status: string | null;
  gender: string | null;
  joinedAt: string;
  lastLogin: string | null;
  avatar: string | null;
  twoFactorEnabled: boolean;
  roles: BackendUserRole[];
};

type BackendUsersPageResponse = {
  items: BackendUserItem[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

type BackendBranchItem = {
  id: string;
  name: string;
  address: string | null;
  companyId: string | null;
  status: string | null;
  agentId: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type BackendBranchesResponse = {
  items: BackendBranchItem[];
};

type ListUsersByCompanyParams = {
  companyId: string;
  filters: UserListFilters;
};

export async function getMyProfile() {
  const response = await apiClient.get<BackendUserItem>(API_ENDPOINTS.users.me);
  return mapUserItem(response.data);
}

export async function listUsersByCompany({
  companyId,
  filters,
}: ListUsersByCompanyParams): Promise<PaginatedResult<UserAccount> & { totalPages: number }> {
  const params = new URLSearchParams();
  params.append("page", String(filters.page));
  params.append("size", String(filters.pageSize));

  if (filters.search.trim()) {
    params.append("search", filters.search.trim());
  }

  if (filters.status !== USER_FILTER_ALL) {
    params.append("status", filters.status);
  }

  if (filters.role !== USER_FILTER_ALL) {
    params.append("roleId", filters.role);
  }

  const response = await apiClient.get<BackendUsersPageResponse>(
    API_ENDPOINTS.users.byCompany(companyId),
    { params },
  );

  const pageData = response.data;
  const mappedItems = pageData.items.map(mapUserItem);

  const filteredItems =
    filters.twoFactor === USER_FILTER_ALL
      ? mappedItems
      : mappedItems.filter((item) =>
          filters.twoFactor === "ENABLED"
            ? item.twoFactorEnabled
            : !item.twoFactorEnabled,
        );

  return {
    items: filteredItems,
    total: pageData.total,
    page: pageData.page,
    pageSize: pageData.size,
    totalPages: pageData.totalPages,
  };
}

export async function listBranchesByCompany(companyId: string): Promise<Branch[]> {
  const response = await apiClient.get<BackendBranchesResponse>(API_ENDPOINTS.branches.byCompany(companyId));

  return response.data.items
    .map((branch) => ({
      id: branch.id,
      name: branch.name,
      address: branch.address,
      companyId: branch.companyId,
      status: normalizeBranchStatus(branch.status),
    }))
    .filter((branch) => branch.status === "ACTIVE");
}

export async function listRoles(): Promise<UserRole[]> {
  return listRolesApi();
}

export async function createUserInCompany(companyId: string, payload: CreateUserPayload) {
  const response = await apiClient.post<BackendUserItem>(
    API_ENDPOINTS.users.byCompany(companyId),
    {
      username: payload.username.trim(),
      email: payload.email.trim(),
      password: payload.password,
      phone: payload.phone ?? "",
      address: payload.address ?? "",
      gender: payload.gender ?? "OTHER",
      status: payload.status,
      roleIds: payload.roleIds,
      branchId: payload.branchId ?? "",
      twoFactorEnabled: payload.twoFactorEnabled,
    },
  );

  return mapUserItem(response.data);
}

export async function updateUserProfile(
  userId: string,
  payload: UpdateUserProfilePayload,
) {
  const response = await apiClient.put<BackendUserItem>(
    API_ENDPOINTS.users.byId(userId),
    {
      username: payload.username.trim(),
      email: payload.email.trim(),
      phone: payload.phone ?? "",
      address: payload.address ?? "",
      gender: payload.gender ?? "OTHER",
      branchId: payload.branchId ?? "",
      roleIds: payload.roleIds,
    },
  );

  return mapUserItem(response.data);
}

export async function updateUserPassword(
  userId: string,
  payload: UpdateUserPasswordPayload,
) {
  await apiClient.patch(API_ENDPOINTS.users.password(userId), {
    password: payload.newPassword,
  });

  return {
    accountId: userId,
    updatedAt: new Date().toISOString(),
  };
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  const response = await apiClient.patch<BackendUserItem>(
    API_ENDPOINTS.users.status(userId),
    { status },
  );

  return mapUserItem(response.data);
}

function mapUserItem(item: BackendUserItem): UserAccount {
  return {
    id: item.id,
    username: item.username,
    email: item.email,
    phone: item.phone,
    address: item.address,
    companyId: item.companyId,
    branchId: item.branchId,
    status: normalizeStatus(item.status),
    gender: normalizeGender(item.gender),
    createdAt: item.joinedAt,
    updatedAt: null,
    joinedAt: item.joinedAt,
    lastLogin: item.lastLogin,
    avatarUrl: item.avatar,
    roles: (item.roles || []).map((role) => ({
      id: role.id,
      roleName: role.roleName,
    })),
    twoFactorEnabled: Boolean(item.twoFactorEnabled),
  };
}

function normalizeStatus(value: string | null): UserStatus {
  if (value === "ONLEAVE") {
    return "ONLEAVE";
  }
  if (value === "RESIGNED") {
    return "RESIGNED";
  }
  return "WORKING";
}

function normalizeGender(value: string | null): "MALE" | "FEMALE" | "OTHER" | null {
  if (value === "MALE" || value === "FEMALE" || value === "OTHER") {
    return value;
  }
  return null;
}

function normalizeBranchStatus(value: string | null): BranchStatus {
  if (value === "INACTIVE") {
    return "INACTIVE";
  }
  return "ACTIVE";
}
