import type { TranslationKey } from "@/shared/i18n/messages";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { AppShell } from "@/widgets/app-shell";

type ManagementPlaceholderPageProps = {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
};

export function ManagementPlaceholderPage({
  titleKey,
  descriptionKey,
}: ManagementPlaceholderPageProps) {
  const { t } = useI18n();

  return (
    <AppShell>
      <section className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">{t(titleKey)}</h1>
          <p className="text-sm text-muted-foreground">{t(descriptionKey)}</p>
        </header>

        <div className="rounded-2xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            {t("common.comingSoon")}
          </p>
        </div>
      </section>
    </AppShell>
  );
}
