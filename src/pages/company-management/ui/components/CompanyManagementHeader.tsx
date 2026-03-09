import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";

type CompanyManagementHeaderProps = {
  companyName: string;
  completionPercent: number;
  isComplete: boolean;
  loading?: boolean;
  onRefresh: () => void;
};

export function CompanyManagementHeader({
  companyName,
  completionPercent,
  isComplete,
  loading = false,
  onRefresh,
}: CompanyManagementHeaderProps) {
  const { t } = useI18n();

  return (
    <section className="bg-card overflow-hidden rounded-2xl border">
      <div className="bg-muted/35 border-b px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-foreground text-xl font-semibold">
                {t("company.profile.title")}
              </h1>
              <Badge
                variant="outline"
                className="h-5 rounded-full px-2 text-[11px]"
              >
                {t("company.profile.badge.selfManaged")}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {t("company.profile.subtitle")}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <HugeiconsIcon icon={RefreshIcon} />
            {t("company.profile.action.refresh")}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 px-4 py-4 md:grid-cols-3 md:px-5">
        <article className="rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100/40 p-3 dark:from-slate-950/40 dark:to-slate-900/30">
          <p className="text-muted-foreground text-xs">
            {t("company.profile.summary.company")}
          </p>
          <p className="text-foreground mt-1 truncate text-sm font-semibold">
            {companyName}
          </p>
        </article>

        <article className="rounded-xl border bg-gradient-to-br from-indigo-50 to-sky-50/70 p-3 dark:from-indigo-950/40 dark:to-sky-950/20">
          <p className="text-muted-foreground text-xs">
            {t("company.profile.summary.completion")}
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="text-foreground text-lg font-semibold">
              {completionPercent}%
            </span>
            <span className="text-muted-foreground text-xs">
              {isComplete
                ? t("company.profile.summary.statusReady")
                : t("company.profile.summary.statusIncomplete")}
            </span>
          </div>
          <Progress value={completionPercent} className="mt-2 h-1.5" />
        </article>

        <article className="rounded-xl border bg-gradient-to-br from-emerald-50 to-teal-50/60 p-3 dark:from-emerald-950/30 dark:to-teal-950/20">
          <p className="text-muted-foreground text-xs">
            {t("company.profile.summary.status")}
          </p>
          <p className="text-foreground mt-1 text-sm font-semibold">
            {isComplete
              ? t("company.profile.summary.statusReady")
              : t("company.profile.summary.statusIncomplete")}
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            {t("company.profile.summary.statusHint")}
          </p>
        </article>
      </div>
    </section>
  );
}
