import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Slider } from "@/shared/ui/slider";
import {
  ACCENT_COLORS,
  AVAILABLE_VIEW_SIZES,
  nearestViewSize,
} from "../../model/settingsPreferences";
import { SettingSwitchRow } from "./SettingSwitchRow";

type AppearanceSettingsCardProps = {
  theme: "light" | "dark";
  viewSize: number;
  accentColor: string;
  compactDensity: boolean;
  onThemeChange: (value: "light" | "dark") => void;
  onViewSizeChange: (value: number) => void;
  onAccentColorChange: (value: string) => void;
  onCompactDensityChange: (next: boolean) => void;
  onResetAppearance: () => void;
};

export function AppearanceSettingsCard({
  theme,
  viewSize,
  accentColor,
  compactDensity,
  onThemeChange,
  onViewSizeChange,
  onAccentColorChange,
  onCompactDensityChange,
  onResetAppearance,
}: AppearanceSettingsCardProps) {
  const { t } = useI18n();

  return (
    <Card id="appearance">
      <CardHeader>
        <CardTitle>{t("settings.appearance.title")}</CardTitle>
        <CardDescription>
          {t("settings.appearance.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <Label>{t("settings.appearance.themeDefault")}</Label>
          <RadioGroup
            value={theme}
            onValueChange={(value) => onThemeChange(value as "light" | "dark")}
            className="grid gap-2 md:grid-cols-2"
          >
            <label className="border-border bg-input/30 flex items-center gap-2 rounded-md border px-3 py-2">
              <RadioGroupItem value="light" />
              <span className="text-sm">{t("common.light")}</span>
            </label>
            <label className="border-border bg-input/30 flex items-center gap-2 rounded-md border px-3 py-2">
              <RadioGroupItem value="dark" />
              <span className="text-sm">{t("common.dark")}</span>
            </label>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t("settings.appearance.viewScale")}</Label>
            <Badge variant="outline">{viewSize}%</Badge>
          </div>
          <Slider
            value={[viewSize]}
            min={75}
            max={100}
            step={1}
            onValueChange={(value) =>
              onViewSizeChange(nearestViewSize(value[0]))
            }
          />
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_VIEW_SIZES.map((size) => (
              <Button
                key={size}
                type="button"
                size="sm"
                variant={size === viewSize ? "default" : "outline"}
                onClick={() => onViewSizeChange(size)}
              >
                {size}%
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>{t("settings.appearance.accent")}</Label>
          <div className="flex flex-wrap items-center gap-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Use accent ${color}`}
                onClick={() => onAccentColorChange(color)}
                className="border-border h-7 w-7 rounded-full border transition hover:scale-105"
                style={{
                  backgroundColor: color,
                  boxShadow:
                    accentColor === color
                      ? "0 0 0 2px var(--background), 0 0 0 4px var(--ring)"
                      : undefined,
                }}
              />
            ))}
            <Input
              value={accentColor}
              onChange={(event) => onAccentColorChange(event.target.value)}
              className="w-[140px]"
            />
          </div>
        </div>

        <SettingSwitchRow
          title={t("settings.appearance.compactDensity.title")}
          description={t("settings.appearance.compactDensity.description")}
          checked={compactDensity}
          onCheckedChange={onCompactDensityChange}
        />

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onResetAppearance}>
            {t("settings.appearance.reset")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
