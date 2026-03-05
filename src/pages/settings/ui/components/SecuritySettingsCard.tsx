import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { SESSION_TIMEOUT_OPTIONS } from "../../model/settingsPreferences";
import { SettingSwitchRow } from "./SettingSwitchRow";

type SecuritySettingsCardProps = {
  enforce2FA: boolean;
  allowIpRestriction: boolean;
  requirePolicyAccepted: boolean;
  sessionTimeout: string;
  onEnforce2FAChange: (next: boolean) => void;
  onAllowIpRestrictionChange: (next: boolean) => void;
  onRequirePolicyAcceptedChange: (next: boolean) => void;
  onSessionTimeoutChange: (value: string) => void;
};

export function SecuritySettingsCard({
  enforce2FA,
  allowIpRestriction,
  requirePolicyAccepted,
  sessionTimeout,
  onEnforce2FAChange,
  onAllowIpRestrictionChange,
  onRequirePolicyAcceptedChange,
  onSessionTimeoutChange,
}: SecuritySettingsCardProps) {
  const { t } = useI18n();

  return (
    <Card id="security">
      <CardHeader>
        <CardTitle>{t("settings.security.title")}</CardTitle>
        <CardDescription>{t("settings.security.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingSwitchRow
          title={t("settings.security.enforce2fa.title")}
          description={t("settings.security.enforce2fa.description")}
          checked={enforce2FA}
          onCheckedChange={onEnforce2FAChange}
        />
        <SettingSwitchRow
          title={t("settings.security.ipRestriction.title")}
          description={t("settings.security.ipRestriction.description")}
          checked={allowIpRestriction}
          onCheckedChange={onAllowIpRestrictionChange}
        />
        <SettingSwitchRow
          title={t("settings.security.requirePolicy.title")}
          description={t("settings.security.requirePolicy.description")}
          checked={requirePolicyAccepted}
          onCheckedChange={onRequirePolicyAcceptedChange}
        />

        <div className="space-y-2">
          <Label htmlFor="session-timeout">
            {t("settings.security.sessionTimeout")}
          </Label>
          <Select value={sessionTimeout} onValueChange={onSessionTimeoutChange}>
            <SelectTrigger id="session-timeout" className="w-full md:w-[220px]">
              <SelectValue
                placeholder={t("settings.security.sessionTimeoutPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              {SESSION_TIMEOUT_OPTIONS.map((option) => (
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
