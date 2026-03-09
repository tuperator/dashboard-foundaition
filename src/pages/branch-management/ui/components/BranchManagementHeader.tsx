import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleHalfDotIcon,
  FilterHorizontalIcon,
  Search01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { BRANCH_FILTER_ALL } from "../../model/constants";
import type { BranchStatusFilter } from "../../model/types";
import { BRANCH_STATUS_VALUES } from "../../model/types";

type BranchManagementHeaderProps = {
  total: number;
  search: string;
  statusFilter: BranchStatusFilter;
  loading?: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: BranchStatusFilter) => void;
  onResetFilters: () => void;
  onOpenCreate: () => void;
  onRefresh: () => void;
};

export function BranchManagementHeader({
  total,
  search,
  statusFilter,
  loading = false,
  onSearchChange,
  onStatusFilterChange,
  onResetFilters,
  onOpenCreate,
  onRefresh,
}: BranchManagementHeaderProps) {
  const { t } = useI18n();

  return (
    <section className="bg-card rounded-2xl border">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4">
        <div className="space-y-1">
          <h1 className="text-foreground text-xl font-semibold">
            {t("branch.title")}{" "}
            <span className="text-muted-foreground text-sm font-medium">
              {total}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("branch.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <HugeiconsIcon icon={RefreshIcon} />
            {t("branch.action.refresh")}
          </Button>
          <Button size="sm" onClick={onOpenCreate}>
            <HugeiconsIcon icon={AddCircleHalfDotIcon} />
            {t("branch.action.add")}
          </Button>
        </div>
      </div>

      <div className="grid gap-2 px-4 py-3 lg:grid-cols-[1fr_220px_auto]">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("branch.filter.searchPlaceholder")}
            className="pl-8"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) =>
            onStatusFilterChange(value as BranchStatusFilter)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("branch.filter.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BRANCH_FILTER_ALL}>
              {t("branch.filter.status.all")}
            </SelectItem>
            {BRANCH_STATUS_VALUES.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "ACTIVE"
                  ? t("branch.badge.active")
                  : status === "INACTIVE"
                    ? t("branch.badge.inactive")
                    : t("branch.badge.deleted")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={onResetFilters}>
          <HugeiconsIcon icon={FilterHorizontalIcon} />
          {t("branch.filter.reset")}
        </Button>
      </div>
    </section>
  );
}
