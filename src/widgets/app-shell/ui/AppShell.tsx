import { useMemo, useState } from "react";
import type { CSSProperties, PropsWithChildren } from "react";
import { AppSidebar } from "./sidebar/AppSidebar";
import { AppSidebarMobileSheet } from "./sidebar/AppSidebarMobileSheet";
import { useTheme } from "@/shared/providers/theme/ThemeProvider";
import {
  AppShellHeader,
  appShellActivities,
  appShellContacts,
  appShellNotifications,
} from "./components";

export function AppShell({ children }: PropsWithChildren) {
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const layoutStyle = useMemo(
    () =>
      ({
        "--sb-layout-width": sidebarCollapsed ? "64px" : "var(--sb-width)",
      }) as CSSProperties,
    [sidebarCollapsed],
  );

  return (
    <div className="bg-background text-foreground h-screen overflow-hidden transition-colors">
      <div className="app-scale-frame">
        <div
          className="mx-auto grid h-full grid-cols-1 motion-safe:transition-[grid-template-columns] motion-safe:duration-300 motion-safe:ease-in-out lg:grid-cols-[var(--sb-layout-width)_minmax(0,1fr)]"
          style={layoutStyle}
        >
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
          />

          <div className="flex min-w-0 flex-col overflow-hidden">
            <AppShellHeader
              theme={theme}
              onToggleTheme={toggleTheme}
              mobileMenu={<AppSidebarMobileSheet />}
              notifications={appShellNotifications}
              activities={appShellActivities}
              contacts={appShellContacts}
            />

            <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-7">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
