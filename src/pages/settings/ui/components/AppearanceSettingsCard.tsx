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
  return (
    <Card id="appearance">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Tùy chỉnh giao diện làm việc: theme, scale hiển thị và màu nhấn chính.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <Label>Theme default</Label>
          <RadioGroup
            value={theme}
            onValueChange={(value) => onThemeChange(value as "light" | "dark")}
            className="grid gap-2 md:grid-cols-2"
          >
            <label className="flex items-center gap-2 rounded-md border border-border bg-input/30 px-3 py-2">
              <RadioGroupItem value="light" />
              <span className="text-sm">Light</span>
            </label>
            <label className="flex items-center gap-2 rounded-md border border-border bg-input/30 px-3 py-2">
              <RadioGroupItem value="dark" />
              <span className="text-sm">Dark</span>
            </label>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>View scale</Label>
            <Badge variant="outline">{viewSize}%</Badge>
          </div>
          <Slider
            value={[viewSize]}
            min={75}
            max={100}
            step={1}
            onValueChange={(value) => onViewSizeChange(nearestViewSize(value[0]))}
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
          <Label>Màu nhấn hệ thống (accent)</Label>
          <div className="flex flex-wrap items-center gap-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Use accent ${color}`}
                onClick={() => onAccentColorChange(color)}
                className="h-7 w-7 rounded-full border border-border transition hover:scale-105"
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
          title="Compact density"
          description="Giảm khoảng cách giữa các block để tăng mật độ hiển thị."
          checked={compactDensity}
          onCheckedChange={onCompactDensityChange}
        />

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onResetAppearance}>
            Reset appearance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
