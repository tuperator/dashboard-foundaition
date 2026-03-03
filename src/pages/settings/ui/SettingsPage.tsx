import { AppShell } from "@/widgets/app-shell";
import { useEffect, useState } from "react";
import { useTheme } from "@/shared/providers/theme/ThemeProvider";
import {
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT,
  DEFAULT_VIEW_SIZE,
  VIEW_SIZE_STORAGE_KEY,
  resolveInitialAccent,
  resolveInitialViewSize,
} from "../model/settingsPreferences";
import {
  AppearanceSettingsCard,
  GeneralSettingsCard,
  SecuritySettingsCard,
  SettingsHeader,
  SettingsSidebarNav,
} from "./components";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [workspaceName, setWorkspaceName] = useState("SnowUI ERP");
  const [language, setLanguage] = useState("vi");
  const [timeZone, setTimeZone] = useState("Asia/Ho_Chi_Minh");

  const [enforce2FA, setEnforce2FA] = useState(true);
  const [allowIpRestriction, setAllowIpRestriction] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30m");
  const [requirePolicyAccepted, setRequirePolicyAccepted] = useState(true);

  const [compactDensity, setCompactDensity] = useState<boolean>(true);
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

  const resetAppearance = () => {
    setTheme("light");
    setViewSize(DEFAULT_VIEW_SIZE);
    setAccentColor(DEFAULT_ACCENT);
    setCompactDensity(true);
  };

  return (
    <AppShell>
      <section className="space-y-4">
        <SettingsHeader />

        <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
          <SettingsSidebarNav />

          <div className="space-y-4">
            <GeneralSettingsCard
              workspaceName={workspaceName}
              language={language}
              timeZone={timeZone}
              onWorkspaceNameChange={setWorkspaceName}
              onLanguageChange={setLanguage}
              onTimeZoneChange={setTimeZone}
            />

            <SecuritySettingsCard
              enforce2FA={enforce2FA}
              allowIpRestriction={allowIpRestriction}
              requirePolicyAccepted={requirePolicyAccepted}
              sessionTimeout={sessionTimeout}
              onEnforce2FAChange={setEnforce2FA}
              onAllowIpRestrictionChange={setAllowIpRestriction}
              onRequirePolicyAcceptedChange={setRequirePolicyAccepted}
              onSessionTimeoutChange={setSessionTimeout}
            />

            <AppearanceSettingsCard
              theme={theme}
              viewSize={viewSize}
              accentColor={accentColor}
              compactDensity={compactDensity}
              onThemeChange={setTheme}
              onViewSizeChange={setViewSize}
              onAccentColorChange={setAccentColor}
              onCompactDensityChange={setCompactDensity}
              onResetAppearance={resetAppearance}
            />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
