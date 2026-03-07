import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUserInCompany,
  getMyProfile,
  listBranchesByCompany,
  listRoles,
  listUsersByCompany,
  updateUserPassword,
  updateUserProfile,
  updateUserStatus,
} from "./userManagement.api";
import {
  USER_DEFAULT_PAGE,
  USER_DEFAULT_PAGE_SIZE,
  USER_FILTER_ALL,
  USER_MANAGEMENT_QUERY_KEYS,
} from "./constants";
import type {
  CreateUserPayload,
  UserTwoFactorFilter,
  UpdateUserPasswordPayload,
  UpdateUserProfilePayload,
  UserStatusFilter,
  UserStatus,
} from "./types";

export function useUserManagement() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(USER_FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>(USER_FILTER_ALL);
  const [twoFactorFilter, setTwoFactorFilter] =
    useState<UserTwoFactorFilter>(USER_FILTER_ALL);
  const [page, setPage] = useState(USER_DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(USER_DEFAULT_PAGE_SIZE);

  const filters = useMemo(
    () => ({
      search,
      role: roleFilter,
      status: statusFilter,
      twoFactor: twoFactorFilter,
      page,
      pageSize,
    }),
    [page, pageSize, roleFilter, search, statusFilter, twoFactorFilter],
  );

  const myProfileQuery = useQuery({
    queryKey: [USER_MANAGEMENT_QUERY_KEYS.me],
    queryFn: getMyProfile,
  });

  const companyId = myProfileQuery.data?.companyId || null;

  const usersQuery = useQuery({
    queryKey: [USER_MANAGEMENT_QUERY_KEYS.list, companyId, filters],
    queryFn: () =>
      listUsersByCompany({
        companyId: companyId as string,
        filters,
      }),
    enabled: Boolean(companyId),
  });

  const rolesQuery = useQuery({
    queryKey: [USER_MANAGEMENT_QUERY_KEYS.roles],
    queryFn: listRoles,
    enabled: myProfileQuery.isSuccess,
  });

  const branchesQuery = useQuery({
    queryKey: [USER_MANAGEMENT_QUERY_KEYS.branches, companyId],
    queryFn: () => listBranchesByCompany(companyId as string),
    enabled: Boolean(companyId),
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      createUserInCompany(companyId as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [USER_MANAGEMENT_QUERY_KEYS.list] });
      void queryClient.invalidateQueries({ queryKey: [USER_MANAGEMENT_QUERY_KEYS.roles] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (args: { userId: string; payload: UpdateUserProfilePayload }) =>
      updateUserProfile(args.userId, args.payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [USER_MANAGEMENT_QUERY_KEYS.list] });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (args: { userId: string; payload: UpdateUserPasswordPayload }) =>
      updateUserPassword(args.userId, args.payload),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (args: { userId: string; status: UserStatus }) =>
      updateUserStatus(args.userId, args.status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [USER_MANAGEMENT_QUERY_KEYS.list] });
    },
  });

  const total = usersQuery.data?.total ?? 0;
  const totalPages =
    usersQuery.data?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));

  const resetFilters = () => {
    setSearch("");
    setRoleFilter(USER_FILTER_ALL);
    setStatusFilter(USER_FILTER_ALL);
    setTwoFactorFilter(USER_FILTER_ALL);
    setPage(USER_DEFAULT_PAGE);
  };

  return {
    myProfileQuery,
    companyId,
    usersQuery,
    rolesQuery,
    branchesQuery,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    twoFactorFilter,
    setTwoFactorFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    resetFilters,
    createUserMutation,
    updateProfileMutation,
    updatePasswordMutation,
    updateStatusMutation,
  };
}
