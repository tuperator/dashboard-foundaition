import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { SETTINGS_SECTION_LINKS } from "../../model/settingsPreferences";

export function SettingsSidebarNav() {
  const { t } = useI18n();

  const sectionLabelByHref: Record<string, string> = {
    "#general": t("settings.section.general"),
    "#security": t("settings.section.security"),
    "#appearance": t("settings.section.appearance"),
  };

  return (
    <Card className="h-fit py-3">
      <CardHeader className="pb-0">
        <CardTitle>{t("settings.sidebar.title")}</CardTitle>
        <CardDescription>{t("settings.sidebar.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        {SETTINGS_SECTION_LINKS.map((section) => (
          <a
            key={section.href}
            href={section.href}
            className="hover:bg-muted block rounded-md px-2 py-1.5 text-sm"
          >
            {sectionLabelByHref[section.href] || section.label}
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
