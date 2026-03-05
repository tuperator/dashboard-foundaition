import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteUser,
  listUserRoles,
  listUsers,
  updateUserPassword,
  updateUserProfile,
  updateUserStatus,
} from "./userManagement.api.mock";
import type {
  UpdateUserPasswordPayload,
  UpdateUserProfilePayload,
  UserStatus,
} from "./types";

const USER_LIST_QUERY_KEY = "user-management-list";
const USER_ROLE_QUERY_KEY = "user-management-roles";

export function useUserManagement() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>("ALL");
  const [twoFactorFilter, setTwoFactorFilter] = useState<
    "ALL" | "ENABLED" | "DISABLED"
  >("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

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

  const usersQuery = useQuery({
    queryKey: [USER_LIST_QUERY_KEY, filters],
    queryFn: () => listUsers(filters),
  });

  const rolesQuery = useQuery({
    queryKey: [USER_ROLE_QUERY_KEY],
    queryFn: listUserRoles,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (args: { userId: string; payload: UpdateUserProfilePayload }) =>
      updateUserProfile(args.userId, args.payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [USER_LIST_QUERY_KEY] });
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
      void queryClient.invalidateQueries({ queryKey: [USER_LIST_QUERY_KEY] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [USER_LIST_QUERY_KEY] });
    },
  });

  const total = usersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setTwoFactorFilter("ALL");
    setPage(1);
  };

  return {
    usersQuery,
    rolesQuery,
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
    updateProfileMutation,
    updatePasswordMutation,
    updateStatusMutation,
    deleteUserMutation,
  };
}
