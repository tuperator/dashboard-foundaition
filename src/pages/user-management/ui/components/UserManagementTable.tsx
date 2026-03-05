import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  Edit01Icon,
  MoreHorizontalCircle01Icon,
  LockPasswordIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import type { Branch, UserAccount, UserStatus } from "../../model/types";
import { UserStatusBadge } from "./UserStatusBadge";

type UserManagementTableProps = {
  users: UserAccount[];
  branchOptions: Branch[];
  loading?: boolean;
  onEditUser: (user: UserAccount) => void;
  onOpenPassword: (user: UserAccount) => void;
  onDeleteUser: (user: UserAccount) => void;
  onChangeStatus: (user: UserAccount, status: UserStatus) => void;
};

export function UserManagementTable({
  users,
  branchOptions,
  loading = false,
  onEditUser,
  onOpenPassword,
  onDeleteUser,
  onChangeStatus,
}: UserManagementTableProps) {
  const { t, locale } = useI18n();
  const branchLabelById = new Map(branchOptions.map((branch) => [branch.id, branch.name]));

  return (
    <Table className="min-w-[980px]">
      <TableHeader>
        <TableRow className="bg-muted/25">
          <TableHead className="w-[56px]">
            <span className="sr-only">{t("users.table.action.menu")}</span>
          </TableHead>
          <TableHead>{t("users.table.fullName")}</TableHead>
          <TableHead>{t("users.table.email")}</TableHead>
          <TableHead>{t("users.table.roles")}</TableHead>
          <TableHead>{t("users.table.branches")}</TableHead>
          <TableHead>{t("users.table.status")}</TableHead>
          <TableHead>{t("users.table.joinedDate")}</TableHead>
          <TableHead>{t("users.table.twoFactor")}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={8}
              className="py-10 text-center text-muted-foreground"
            >
              {t("users.table.loading")}
            </TableCell>
          </TableRow>
        ) : null}

        {!loading && users.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={8}
              className="py-10 text-center text-muted-foreground"
            >
              {t("users.table.empty")}
            </TableCell>
          </TableRow>
        ) : null}

        {!loading
          ? users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={t("users.table.action.menu")}
                      >
                        <HugeiconsIcon
                          icon={MoreHorizontalCircle01Icon}
                          className="size-3.5"
                        />
                        <span className="sr-only">{t("users.table.action.menu")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-44 rounded-lg [zoom:var(--app-scale)]"
                    >
                      <DropdownMenuItem onClick={() => onEditUser(user)}>
                        <HugeiconsIcon icon={Edit01Icon} className="size-3.5" />
                        {t("users.table.action.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onOpenPassword(user)}>
                        <HugeiconsIcon icon={LockPasswordIcon} className="size-3.5" />
                        {t("users.table.action.password")}
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          {t("users.table.action.changeStatus")}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-40 rounded-lg [zoom:var(--app-scale)]">
                          <DropdownMenuItem
                            onClick={() => onChangeStatus(user, "WORKING")}
                          >
                            {t("users.status.working")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onChangeStatus(user, "ONLEAVE")}
                          >
                            {t("users.status.onLeave")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onChangeStatus(user, "RESIGNED")}
                          >
                            {t("users.status.resigned")}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDeleteUser(user)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                        {t("users.table.action.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="inline-grid size-6 place-content-center rounded-full bg-gradient-to-br from-[#c8d8ff] to-[#91b8ff] text-[10px] font-semibold text-slate-800">
                      {toInitials(user.username)}
                    </span>
                    <span className="font-medium text-foreground">{user.username}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-muted-foreground underline decoration-dotted underline-offset-3">
                    {user.email}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex max-w-[220px] flex-wrap items-center gap-1">
                    {user.roles.slice(0, 2).map((role) => (
                      <Badge
                        key={role.id}
                        variant="outline"
                        className="h-5 rounded-full"
                      >
                        {role.roleName}
                      </Badge>
                    ))}
                    {user.roles.length > 2 ? (
                      <Badge variant="outline" className="h-5 rounded-full">
                        +{user.roles.length - 2}
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex max-w-[220px] flex-wrap items-center gap-1">
                    {user.branchIds.slice(0, 2).map((branchId) => (
                      <Badge key={branchId} variant="outline" className="h-5 rounded-full">
                        {branchLabelById.get(branchId) || branchId}
                      </Badge>
                    ))}
                    {user.branchIds.length > 2 ? (
                      <Badge variant="outline" className="h-5 rounded-full">
                        +{user.branchIds.length - 2}
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>

                <TableCell>
                  <UserStatusBadge status={user.status} />
                </TableCell>

                <TableCell>{formatDateTime(user.joinedAt, locale)}</TableCell>

                <TableCell>
                  <Badge
                    className={
                      user.twoFactorEnabled
                        ? "h-5 border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "h-5 border-slate-200 bg-slate-50 text-slate-500"
                    }
                    variant="outline"
                  >
                    {user.twoFactorEnabled
                      ? t("users.twoFactor.enabled")
                      : t("users.twoFactor.disabled")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          : null}
      </TableBody>
    </Table>
  );
}

function toInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function formatDateTime(value: string, locale: "vi" | "en") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const formatterLocale = locale === "vi" ? "vi-VN" : "en-GB";

  return new Intl.DateTimeFormat(formatterLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
