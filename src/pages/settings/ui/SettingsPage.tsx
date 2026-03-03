import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/widgets/app-shell";
import { appRoutes } from "@/shared/constants/routes";
import { useTheme } from "@/shared/providers/theme/ThemeProvider";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Slider } from "@/shared/ui/slider";
import { Switch } from "@/shared/ui/switch";

const VIEW_SIZE_STORAGE_KEY = "app-view-size";
const ACCENT_STORAGE_KEY = "app-accent-color";
const DEFAULT_VIEW_SIZE = 80;
const DEFAULT_ACCENT = "#111827";
const AVAILABLE_VIEW_SIZES = [75, 80, 90, 100] as const;
const ACCENT_COLORS = [
  "#111827",
  "#1d4ed8",
  "#0f766e",
  "#7c3aed",
  "#be123c",
  "#ea580c",
] as const;

function resolveInitialViewSize() {
  if (typeof window === "undefined") {
    return DEFAULT_VIEW_SIZE;
  }

  const saved = window.localStorage.getItem(VIEW_SIZE_STORAGE_KEY);
  if (!saved) {
    return DEFAULT_VIEW_SIZE;
  }

  const numeric = Number(saved);
  return AVAILABLE_VIEW_SIZES.includes(
    numeric as (typeof AVAILABLE_VIEW_SIZES)[number],
  )
    ? numeric
    : DEFAULT_VIEW_SIZE;
}

function resolveInitialAccent() {
  if (typeof window === "undefined") {
    return DEFAULT_ACCENT;
  }

  const saved = window.localStorage.getItem(ACCENT_STORAGE_KEY);
  return saved || DEFAULT_ACCENT;
}

function nearestViewSize(value: number) {
  return AVAILABLE_VIEW_SIZES.reduce((closest, current) =>
    Math.abs(current - value) < Math.abs(closest - value) ? current : closest,
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [workspaceName, setWorkspaceName] = useState("SnowUI ERP");
  const [language, setLanguage] = useState("vi");
  const [timeZone, setTimeZone] = useState("Asia/Ho_Chi_Minh");

  const [enforce2FA, setEnforce2FA] = useState(true);
  const [allowIpRestriction, setAllowIpRestriction] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30m");
  const [requirePolicyAccepted, setRequirePolicyAccepted] = useState(true);

  const [compactDensity, setCompactDensity] = useState(true);
  const [viewSize, setViewSize] = useState(resolveInitialViewSize);
  const [accentColor, setAccentColor] = useState(resolveInitialAccent);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-view-size", String(viewSize));
    window.localStorage.setItem(VIEW_SIZE_STORAGE_KEY, String(viewSize));
  }, [viewSize]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", accentColor);
    root.style.setProperty("--ring", accentColor);
    root.style.setProperty("--sidebar-primary", accentColor);
    window.localStorage.setItem(ACCENT_STORAGE_KEY, accentColor);
  }, [accentColor]);

  const viewScalePercent = useMemo(() => `${viewSize}%`, [viewSize]);

  const resetAppearance = () => {
    setTheme("light");
    setViewSize(DEFAULT_VIEW_SIZE);
    setAccentColor(DEFAULT_ACCENT);
    setCompactDensity(true);
  };

  return (
    <AppShell>
      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-foreground text-2xl leading-8 font-semibold">
              System Settings
            </h1>
            <p className="text-muted-foreground text-sm">
              Quản lý cấu hình chung: ngôn ngữ, chính sách bảo mật và giao diện
              làm việc.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">Auto-save local</Badge>
            <Button asChild variant="outline">
              <Link to={appRoutes.dashboard}>Back to dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
          <Card className="h-fit py-3">
            <CardHeader className="pb-0">
              <CardTitle>Danh mục</CardTitle>
              <CardDescription>Nhóm cấu hình cơ bản</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              <a href="#general" className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                General
              </a>
              <a href="#security" className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                Security & Policy
              </a>
              <a
                href="#appearance"
                className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted"
              >
                Appearance
              </a>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card id="general">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Cấu hình thông tin vận hành mặc định cho doanh nghiệp.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="workspace-name">Workspace name</Label>
                  <Input
                    id="workspace-name"
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timeZone} onValueChange={setTimeZone}>
                    <SelectTrigger id="timezone" className="w-full">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Ho_Chi_Minh">
                        Asia/Ho_Chi_Minh (GMT+7)
                      </SelectItem>
                      <SelectItem value="Asia/Bangkok">
                        Asia/Bangkok (GMT+7)
                      </SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card id="security">
              <CardHeader>
                <CardTitle>Security & Policy</CardTitle>
                <CardDescription>
                  Thiết lập các lớp bảo vệ cơ bản cho người dùng và dữ liệu.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingSwitchRow
                  title="Bắt buộc 2FA cho tài khoản quản trị"
                  description="Giảm rủi ro bị truy cập trái phép vào khu vực quản trị."
                  checked={enforce2FA}
                  onCheckedChange={setEnforce2FA}
                />
                <SettingSwitchRow
                  title="Giới hạn truy cập theo IP nội bộ"
                  description="Chỉ cho phép đăng nhập từ danh sách IP được cấp quyền."
                  checked={allowIpRestriction}
                  onCheckedChange={setAllowIpRestriction}
                />
                <SettingSwitchRow
                  title="Bắt buộc người dùng chấp nhận chính sách mới"
                  description="Hiển thị hộp xác nhận khi có cập nhật điều khoản sử dụng."
                  checked={requirePolicyAccepted}
                  onCheckedChange={setRequirePolicyAccepted}
                />

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session timeout</Label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger id="session-timeout" className="w-full md:w-[220px]">
                      <SelectValue placeholder="Select timeout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15m">15 minutes</SelectItem>
                      <SelectItem value="30m">30 minutes</SelectItem>
                      <SelectItem value="60m">60 minutes</SelectItem>
                      <SelectItem value="120m">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card id="appearance">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Tùy chỉnh giao diện làm việc: theme, scale hiển thị và màu
                  nhấn chính.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <Label>Theme default</Label>
                  <RadioGroup
                    value={theme}
                    onValueChange={(value) => setTheme(value as "light" | "dark")}
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
                    <Badge variant="outline">{viewScalePercent}</Badge>
                  </div>
                  <Slider
                    value={[viewSize]}
                    min={75}
                    max={100}
                    step={1}
                    onValueChange={(value) => setViewSize(nearestViewSize(value[0]))}
                  />
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_VIEW_SIZES.map((size) => (
                      <Button
                        key={size}
                        type="button"
                        size="sm"
                        variant={size === viewSize ? "default" : "outline"}
                        onClick={() => setViewSize(size)}
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
                        onClick={() => setAccentColor(color)}
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
                      onChange={(event) => setAccentColor(event.target.value)}
                      className="w-[140px]"
                    />
                  </div>
                </div>

                <SettingSwitchRow
                  title="Compact density"
                  description="Giảm khoảng cách giữa các block để tăng mật độ hiển thị."
                  checked={compactDensity}
                  onCheckedChange={setCompactDensity}
                />

                <div className="flex justify-end">
                  <Button type="button" variant="outline" onClick={resetAppearance}>
                    Reset appearance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function SettingSwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-input/15 px-3 py-2.5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
