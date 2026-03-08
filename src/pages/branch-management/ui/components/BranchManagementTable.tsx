import { HugeiconsIcon } from "@hugeicons/react";
import {
  Edit01Icon,
  MoreHorizontalCircle01Icon,
} from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import {
  BRANCH_ACTION_MENU_CLASS,
  BRANCH_STATUS_SUB_MENU_CLASS,
  BRANCH_TABLE_COLUMN_COUNT,
  BRANCH_TABLE_MIN_WIDTH_CLASS,
} from "../../model/constants";
import type { BranchItem, BranchStatus } from "../../model/types";
import { BRANCH_STATUS_VALUES } from "../../model/types";
import { BranchStatusBadge } from "./BranchStatusBadge";

type BranchManagementTableProps = {
  branches: BranchItem[];
  loading?: boolean;
  onEdit: (branch: BranchItem) => void;
  onChangeStatus: (branch: BranchItem, status: BranchStatus) => void;
};

export function BranchManagementTable({
  branches,
  loading = false,
  onEdit,
  onChangeStatus,
}: BranchManagementTableProps) {
  const { t, locale } = useI18n();

  return (
    <Table className={BRANCH_TABLE_MIN_WIDTH_CLASS}>
      <TableHeader>
        <TableRow className="bg-muted/25">
          <TableHead className="w-[52px]">
            <span className="sr-only">{t("branch.table.actions")}</span>
          </TableHead>
          <TableHead>{t("branch.table.name")}</TableHead>
          <TableHead>{t("branch.table.address")}</TableHead>
          <TableHead>{t("branch.table.status")}</TableHead>
          <TableHead>{t("branch.table.agentId")}</TableHead>
          <TableHead>{t("branch.table.createdAt")}</TableHead>
          <TableHead>{t("branch.table.updatedAt")}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={BRANCH_TABLE_COLUMN_COUNT}
              className="py-10 text-center text-muted-foreground"
            >
              {t("branch.table.loading")}
            </TableCell>
          </TableRow>
        ) : null}

        {!loading && branches.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={BRANCH_TABLE_COLUMN_COUNT}
              className="py-10 text-center text-muted-foreground"
            >
              {t("branch.table.empty")}
            </TableCell>
          </TableRow>
        ) : null}

        {!loading
          ? branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={t("branch.menu.openActions")}
                      >
                        <HugeiconsIcon
                          icon={MoreHorizontalCircle01Icon}
                          className="size-3.5"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className={BRANCH_ACTION_MENU_CLASS}>
                      <DropdownMenuItem onClick={() => onEdit(branch)}>
                        <HugeiconsIcon icon={Edit01Icon} className="size-3.5" />
                        {t("branch.menu.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          {t("branch.menu.changeStatus")}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className={BRANCH_STATUS_SUB_MENU_CLASS}>
                          {BRANCH_STATUS_VALUES.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => onChangeStatus(branch, status)}
                            >
                              {status === "ACTIVE"
                                ? t("branch.badge.active")
                                : status === "INACTIVE"
                                  ? t("branch.badge.inactive")
                                  : t("branch.badge.deleted")}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>

                <TableCell>
                  <span className="font-medium text-foreground">{branch.name}</span>
                </TableCell>

                <TableCell>
                  <span className="text-muted-foreground text-xs">
                    {branch.address || "-"}
                  </span>
                </TableCell>

                <TableCell>
                  <BranchStatusBadge status={branch.status} />
                </TableCell>

                <TableCell>
                  <span className="text-muted-foreground text-xs">
                    {branch.agentId || "-"}
                  </span>
                </TableCell>

                <TableCell>{formatDateTime(branch.createdAt, locale)}</TableCell>
                <TableCell>{formatDateTime(branch.updatedAt, locale)}</TableCell>
              </TableRow>
            ))
          : null}
      </TableBody>
    </Table>
  );
}

function formatDateTime(value: string | null, locale: "vi" | "en") {
  if (!value) {
    return "-";
  }

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
