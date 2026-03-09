import { Link } from "react-router-dom";
import { appRoutes } from "@/shared/constants/routes";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export function SettingsHeader() {
  const { t } = useI18n();

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl leading-8 font-semibold">
          {t("settings.header.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("settings.header.description")}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline">{t("settings.header.autoSave")}</Badge>
        <Button asChild variant="outline">
          <Link to={appRoutes.dashboard}>
            {t("settings.header.backDashboard")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
