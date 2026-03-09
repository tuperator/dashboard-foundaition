import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { AppShell } from "@/widgets/app-shell";
import { Button } from "@/shared/ui/button";

type TaskProjectDetailsNotFoundProps = {
  onBack: () => void;
};

export function TaskProjectDetailsNotFound({
  onBack,
}: TaskProjectDetailsNotFoundProps) {
  const { t } = useI18n();

  return (
    <AppShell>
      <section className="space-y-4">
        <header className="rounded-2xl border bg-card p-4">
          <h1 className="text-xl font-semibold text-foreground">
            {t("tasks.projectDetails.notFoundTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("tasks.projectDetails.notFoundDescription")}
          </p>
        </header>
        <section className="rounded-2xl border bg-card p-5">
          <Button variant="outline" onClick={onBack}>
            <HugeiconsIcon icon={ArrowLeft01Icon} />
            {t("tasks.common.backToWorkspace")}
          </Button>
        </section>
      </section>
    </AppShell>
  );
}
