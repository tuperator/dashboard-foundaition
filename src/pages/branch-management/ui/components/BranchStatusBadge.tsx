import { Badge } from "@/shared/ui/badge";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import type { BranchStatus } from "../../model/types";

const BRANCH_STATUS_STYLES: Record<
  BranchStatus,
  {
    className: string;
    labelKey:
      | "branch.badge.active"
      | "branch.badge.inactive"
      | "branch.badge.deleted";
  }
> = {
  ACTIVE: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    labelKey: "branch.badge.active",
  },
  INACTIVE: {
    className: "border-amber-200 bg-amber-50 text-amber-700",
    labelKey: "branch.badge.inactive",
  },
  DELETED: {
    className: "border-rose-200 bg-rose-50 text-rose-700",
    labelKey: "branch.badge.deleted",
  },
};

export function BranchStatusBadge({ status }: { status: BranchStatus }) {
  const { t } = useI18n();
  const config = BRANCH_STATUS_STYLES[status];

  return (
    <Badge
      variant="outline"
      className={`h-5 rounded-full px-2 ${config.className}`}
    >
      {t(config.labelKey)}
    </Badge>
  );
}
