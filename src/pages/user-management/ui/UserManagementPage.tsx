import { useMemo, useState } from "react";
import { AppShell } from "@/widgets/app-shell";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/shared/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useUserManagement } from "../model/useUserManagement";
import type {
  UpdateUserProfilePayload,
  UserAccount,
  UserStatus,
} from "../model/types";
import { DeleteUserAlert } from "./components/DeleteUserAlert";
import { UserManagementHeader } from "./components/UserManagementHeader";
import { UserManagementTable } from "./components/UserManagementTable";
import { UserPasswordDialog } from "./components/UserPasswordDialog";
import { UserProfileSheet } from "./components/UserProfileSheet";

const EMPTY_USERS: UserAccount[] = [];

export function UserManagementPage() {
  const { t, tp } = useI18n();
  const appToast = useAppToast();
  const {
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
  } = useUserManagement();

  const users = usersQuery.data?.items ?? EMPTY_USERS;
  const roleOptions = rolesQuery.data || [];

  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);

  const pages = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 7),
    [totalPages],
  );

  const rowStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rowEnd = Math.min(page * pageSize, total);

  const handleEditProfile = async (payload: UpdateUserProfilePayload) => {
    if (!editingUser) {
      return;
    }

    try {
      const updated = await updateProfileMutation.mutateAsync({
        userId: editingUser.id,
        payload,
      });
      setEditingUser(null);
      appToast.success({
        title: tp("users.notice.profileUpdated.title", {
          name: updated.username,
        }),
        description: t("users.notice.profileUpdated.description"),
      });
    } catch (error) {
      appToast.error({
        title: t("users.notice.error.updateProfile"),
        description: resolveErrorMessage(error, t),
      });
    }
  };

  const handleUpdatePassword = async (newPassword: string) => {
    if (!passwordUser) {
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        userId: passwordUser.id,
        payload: { newPassword },
      });
      const updatedName = passwordUser.username;
      setPasswordUser(null);
      appToast.success({
        title: t("users.notice.passwordUpdated.title"),
        description: tp("users.notice.passwordUpdated.description", {
          name: updatedName,
        }),
      });
    } catch (error) {
      appToast.error({
        title: t("users.notice.error.updatePassword"),
        description: resolveErrorMessage(error, t),
      });
    }
  };

  const handleChangeStatus = async (
    user: UserAccount,
    nextStatus: UserStatus,
  ) => {
    if (user.status === nextStatus) {
      return;
    }

    try {
      const updated = await updateStatusMutation.mutateAsync({
        userId: user.id,
        status: nextStatus,
      });
      appToast.success({
        title: tp("users.notice.statusChanged.title", {
          name: updated.username,
        }),
        description: tp("users.notice.statusChanged.description", {
          status: updated.status,
        }),
      });
    } catch (error) {
      appToast.error({
        title: t("users.notice.error.changeStatus"),
        description: resolveErrorMessage(error, t),
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) {
      return;
    }

    try {
      const deletedName = deletingUser.username;
      await deleteUserMutation.mutateAsync(deletingUser.id);
      setDeletingUser(null);
      appToast.success({
        title: t("users.notice.userDeleted.title"),
        description: tp("users.notice.userDeleted.description", {
          name: deletedName,
        }),
      });
    } catch (error) {
      appToast.error({
        title: t("users.notice.error.deleteUser"),
        description: resolveErrorMessage(error, t),
      });
    }
  };

  return (
    <AppShell>
      <section className="space-y-4">
        <UserManagementHeader
          totalUsers={total}
          search={search}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          twoFactorFilter={twoFactorFilter}
          roleOptions={roleOptions}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onRoleFilterChange={(value) => {
            setRoleFilter(value);
            setPage(1);
          }}
          onStatusFilterChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          onTwoFactorFilterChange={(value) => {
            setTwoFactorFilter(value);
            setPage(1);
          }}
          onResetFilters={resetFilters}
        />

        <div className="bg-card rounded-2xl border p-3">
          <UserManagementTable
            users={users}
            loading={usersQuery.isLoading}
            onEditUser={setEditingUser}
            onOpenPassword={setPasswordUser}
            onDeleteUser={setDeletingUser}
            onChangeStatus={handleChangeStatus}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span>{t("users.rowsPerPage")}</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger size="sm" className="w-[88px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
              <span>
                {tp("users.rowsRange", { start: rowStart, end: rowEnd, total })}
              </span>
            </div>

            <Pagination className="mx-0 w-auto justify-start">
              <PaginationContent>
                {pages.map((value) => (
                  <PaginationItem key={value}>
                    <PaginationLink
                      href="#"
                      size="icon-sm"
                      isActive={value === page}
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(value);
                      }}
                    >
                      {value}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </section>

      <UserProfileSheet
        open={Boolean(editingUser)}
        user={editingUser}
        roleOptions={roleOptions}
        submitting={updateProfileMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null);
          }
        }}
        onSubmit={handleEditProfile}
      />

      <UserPasswordDialog
        open={Boolean(passwordUser)}
        user={passwordUser}
        submitting={updatePasswordMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordUser(null);
          }
        }}
        onSubmit={handleUpdatePassword}
      />

      <DeleteUserAlert
        open={Boolean(deletingUser)}
        user={deletingUser}
        submitting={deleteUserMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingUser(null);
          }
        }}
        onConfirm={handleDeleteUser}
      />
    </AppShell>
  );
}

function resolveErrorMessage(
  error: unknown,
  t: (
    key:
      | "users.error.passwordPolicy"
      | "users.error.notFound"
      | "users.error.unknown",
  ) => string,
) {
  if (error instanceof Error) {
    if (error.message === "PASSWORD_POLICY_INVALID") {
      return t("users.error.passwordPolicy");
    }

    if (error.message === "USER_NOT_FOUND") {
      return t("users.error.notFound");
    }
  }

  return t("users.error.unknown");
}
