import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import type { Locale } from "@/shared/i18n/messages";
import { Label } from "@/shared/ui/label";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  LANGUAGE_OPTIONS,
  TIME_ZONE_OPTIONS,
} from "../../model/settingsPreferences";

type GeneralSettingsCardProps = {
  workspaceName: string;
  language: Locale;
  timeZone: string;
  onWorkspaceNameChange: (value: string) => void;
  onLanguageChange: (value: Locale) => void;
  onTimeZoneChange: (value: string) => void;
};

export function GeneralSettingsCard({
  workspaceName,
  language,
  timeZone,
  onWorkspaceNameChange,
  onLanguageChange,
  onTimeZoneChange,
}: GeneralSettingsCardProps) {
  const { t } = useI18n();

  return (
    <Card id="general">
      <CardHeader>
        <CardTitle>{t("settings.general.title")}</CardTitle>
        <CardDescription>{t("settings.general.description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="workspace-name">
            {t("settings.general.workspaceName")}
          </Label>
          <Input
            id="workspace-name"
            value={workspaceName}
            onChange={(event) => onWorkspaceNameChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">{t("settings.general.language")}</Label>
          <Select
            value={language}
            onValueChange={(value) => onLanguageChange(value as Locale)}
          >
            <SelectTrigger id="language" className="w-full">
              <SelectValue
                placeholder={t("settings.general.languagePlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="timezone">{t("settings.general.timezone")}</Label>
          <Select value={timeZone} onValueChange={onTimeZoneChange}>
            <SelectTrigger id="timezone" className="w-full">
              <SelectValue
                placeholder={t("settings.general.timezonePlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              {TIME_ZONE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
