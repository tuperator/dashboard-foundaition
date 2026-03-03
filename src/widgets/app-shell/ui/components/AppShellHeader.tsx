import type { ComponentProps, ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LayoutIcon,
  MoonIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { AppShellNotificationSheet } from "./AppShellNotificationSheet";

type FeedItem = {
  title: string;
  time: string;
};

type IconType = ComponentProps<typeof HugeiconsIcon>["icon"];

type AppShellHeaderProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  mobileMenu: ReactNode;
  notifications: FeedItem[];
  activities: FeedItem[];
  contacts: string[];
};

export function AppShellHeader({
  theme,
  onToggleTheme,
  mobileMenu,
  notifications,
  activities,
  contacts,
}: AppShellHeaderProps) {
  return (
    <header className="border-border/90 bg-card shrink-0 border-b px-3 py-2.5 shadow-[0_1px_0_rgba(16,24,40,0.03)] md:px-5 md:py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="lg:hidden">{mobileMenu}</div>

          <div className="text-foreground/70 hidden items-center gap-2 text-[13px] md:flex">
            <HugeiconsIcon icon={LayoutIcon} className="size-3.5" />
            <span>Dashboards</span>
            <span>/</span>
            <span className="text-foreground">Default</span>
          </div>

          <span className="text-foreground/80 truncate text-sm font-medium md:hidden">
            Default
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="border-border bg-background text-foreground/65 hidden h-7 w-[168px] items-center rounded-lg border px-2 md:flex">
            <HugeiconsIcon icon={SearchIcon} className="mr-1.5 size-3.5" />
            <span className="text-xs">Search</span>
            <span className="ml-auto text-xs">/</span>
          </div>

          <button
            type="button"
            aria-label="Toggle theme"
            onClick={onToggleTheme}
            className="text-foreground/65 hover:bg-muted hover:text-foreground grid h-7 w-7 place-content-center rounded-md transition"
          >
            <HugeiconsIcon
              icon={theme === "dark" ? SunIcon : MoonIcon}
              className="size-4"
            />
          </button>
          <HeaderIcon icon={SettingsIcon} />
          <AppShellNotificationSheet
            notifications={notifications}
            activities={activities}
            contacts={contacts}
          />
          <HeaderIcon icon={UserIcon} />
        </div>
      </div>
    </header>
  );
}

function HeaderIcon({ icon }: { icon: IconType }) {
  return (
    <button
      type="button"
      className="text-foreground/65 hover:bg-muted hover:text-foreground grid h-7 w-7 place-content-center rounded-md transition"
    >
      <HugeiconsIcon icon={icon} className="size-4" />
    </button>
  );
}
