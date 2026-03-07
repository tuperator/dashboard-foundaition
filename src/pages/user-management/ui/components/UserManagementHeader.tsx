import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleHalfDotIcon,
  FilterHorizontalIcon,
  Search01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import type { UserRole } from "../../model/types";
import {
  USER_FILTER_ALL,
} from "../../model/constants";
import {
  USER_STATUS_VALUES,
  type UserStatusFilter,
  type UserTwoFactorFilter,
} from "../../model/types";

type UserManagementHeaderProps = {
  totalUsers: number;
  search: string;
  roleFilter: string;
  statusFilter: UserStatusFilter;
  twoFactorFilter: UserTwoFactorFilter;
  roleOptions: UserRole[];
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onStatusFilterChange: (value: UserStatusFilter) => void;
  onTwoFactorFilterChange: (value: UserTwoFactorFilter) => void;
  onResetFilters: () => void;
  onOpenCreateUser: () => void;
};

export function UserManagementHeader({
  totalUsers,
  search,
  roleFilter,
  statusFilter,
  twoFactorFilter,
  roleOptions,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onTwoFactorFilterChange,
  onResetFilters,
  onOpenCreateUser,
}: UserManagementHeaderProps) {
  const { t } = useI18n();

  return (
    <section className="rounded-2xl border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">
            {t("users.title")}{" "}
            <span className="text-muted-foreground text-sm font-medium">{totalUsers}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("users.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={AddCircleHalfDotIcon} />
            {t("users.action.export")}
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/85 dark:text-white"
            onClick={onOpenCreateUser}
          >
            <HugeiconsIcon icon={UserAdd01Icon} />
            {t("users.action.addUser")}
          </Button>
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="h-6">
            {t("users.tab.table")}
          </Badge>
          <Badge variant="outline" className="h-6 opacity-70">
            {t("users.tab.board")}
          </Badge>
          <Badge variant="outline" className="h-6 opacity-70">
            {t("users.tab.list")}
          </Badge>
        </div>

        <div className="grid gap-2 lg:grid-cols-[1.2fr_repeat(3,minmax(0,180px))_auto]">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
            />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("users.filter.searchPlaceholder")}
              className="pl-8"
            />
          </div>

          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("users.filter.role")} />
            </SelectTrigger>
          <SelectContent>
              <SelectItem value={USER_FILTER_ALL}>{t("users.filter.allRoles")}</SelectItem>
              {roleOptions.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.roleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => onStatusFilterChange(value as UserStatusFilter)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("users.filter.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={USER_FILTER_ALL}>{t("users.filter.allStatus")}</SelectItem>
              {USER_STATUS_VALUES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "WORKING"
                    ? t("users.status.working")
                    : status === "ONLEAVE"
                      ? t("users.status.onLeave")
                      : t("users.status.resigned")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={twoFactorFilter}
            onValueChange={(value) =>
              onTwoFactorFilterChange(value as UserTwoFactorFilter)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("users.filter.twoFactor")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={USER_FILTER_ALL}>{t("users.filter.twoFactorAll")}</SelectItem>
              <SelectItem value="ENABLED">{t("users.filter.twoFactorEnabled")}</SelectItem>
              <SelectItem value="DISABLED">{t("users.filter.twoFactorDisabled")}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={onResetFilters}>
            <HugeiconsIcon icon={FilterHorizontalIcon} />
            {t("users.filter.reset")}
          </Button>
        </div>
      </div>
    </section>
  );
}
