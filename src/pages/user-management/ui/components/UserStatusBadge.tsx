import { Badge } from "@/shared/ui/badge";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import type { UserStatus } from "../../model/types";

const statusConfig: Record<
  UserStatus,
  { className: string; dotClassName: string }
> = {
  WORKING: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
  ONLEAVE: {
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dotClassName: "bg-amber-500",
  },
  RESIGNED: {
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dotClassName: "bg-rose-500",
  },
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const { t } = useI18n();
  const config = statusConfig[status];
  const label =
    status === "WORKING"
      ? t("users.status.working")
      : status === "ONLEAVE"
        ? t("users.status.onLeave")
        : t("users.status.resigned");

  return (
    <Badge
      variant="outline"
      className={`h-6 gap-1.5 rounded-full px-2 text-[11px] ${config.className}`}
    >
      <span className={`size-1.5 rounded-full ${config.dotClassName}`} />
      {label}
    </Badge>
  );
}
