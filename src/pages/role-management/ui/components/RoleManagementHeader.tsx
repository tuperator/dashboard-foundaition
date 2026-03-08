import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";

type RoleManagementHeaderProps = {
  total: number;
  loading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
};

export function RoleManagementHeader({
  total,
  loading = false,
  search,
  onSearchChange,
  onRefresh,
}: RoleManagementHeaderProps) {
  const { t } = useI18n();

  return (
    <section className="rounded-2xl border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">
              {t("role.title")}{" "}
              <span className="text-muted-foreground text-sm font-medium">{total}</span>
            </h1>
            <Badge variant="outline" className="h-5 rounded-full px-2">
              {t("role.readOnly.badge")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{t("role.subtitle")}</p>
        </div>

        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <HugeiconsIcon icon={RefreshIcon} />
          {t("role.action.refresh")}
        </Button>
      </div>

      <div className="px-4 py-3">
        <div className="relative max-w-[420px]">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("role.filter.searchPlaceholder")}
            className="pl-8"
          />
        </div>
      </div>
    </section>
  );
}
