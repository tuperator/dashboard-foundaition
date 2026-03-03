import type { ComponentProps, PropsWithChildren } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SearchIcon,
  NotificationIcon,
  SettingsIcon,
  UserIcon,
  LayoutIcon,
  SunIcon,
  MoonIcon,
} from "@hugeicons/core-free-icons";
import { AppSidebar } from "./sidebar/AppSidebar";
import { useTheme } from "@/shared/providers/theme/ThemeProvider";

const notifications = [
  { title: "You fixed a bug.", time: "Just now" },
  { title: "New user registered.", time: "59 minutes ago" },
  { title: "You fixed a bug.", time: "12 hours ago" },
];

const activities = [
  { title: "Changed the style.", time: "Just now" },
  { title: "Released a new version.", time: "59 minutes ago" },
  { title: "Submitted a bug.", time: "12 hours ago" },
  { title: "Modified 4 data in Page X.", time: "Today, 11:59 AM" },
  { title: "Deleted a page in Project X.", time: "Feb 2, 2026" },
];

const contacts = [
  "Natali Craig",
  "Drew Cano",
  "Andi Lane",
  "Koray Okumus",
  "Kate Morrison",
  "Melody Macy",
];

const mobileQuickMenus = ["Overview", "Projects", "User", "Account", "Blog"];

type IconType = ComponentProps<typeof HugeiconsIcon>["icon"];

export function AppShell({ children }: PropsWithChildren) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-background text-foreground h-screen overflow-hidden transition-colors">
      <div className="app-scale-frame">
        <div className="mx-auto grid h-full grid-cols-1 lg:grid-cols-[var(--sb-width)_minmax(0,1fr)] 2xl:grid-cols-[var(--sb-width)_minmax(0,1fr)_280px]">
          <AppSidebar />

          <div className="flex min-w-0 flex-col overflow-hidden">
            <header className="border-border/90 bg-card shrink-0 border-b px-3 py-2.5 shadow-[0_1px_0_rgba(16,24,40,0.03)] md:px-5 md:py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="text-foreground/70 hidden items-center gap-2 text-[13px] md:flex">
                  <HugeiconsIcon icon={LayoutIcon} className="size-[15px]" />
                  <span>Dashboards</span>
                  <span>/</span>
                  <span className="text-foreground">Default</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="border-border bg-background text-foreground/65 hidden h-7 w-[168px] items-center rounded-lg border px-2 md:flex">
                    <HugeiconsIcon
                      icon={SearchIcon}
                      className="mr-1.5 size-3.5"
                    />
                    <span className="text-xs">Search</span>
                    <span className="ml-auto text-xs">/</span>
                  </div>

                  <button
                    type="button"
                    aria-label="Toggle theme"
                    onClick={toggleTheme}
                    className="text-foreground/65 hover:bg-muted hover:text-foreground grid h-7 w-7 place-content-center rounded-md transition"
                  >
                    <HugeiconsIcon
                      icon={theme === "dark" ? SunIcon : MoonIcon}
                      className="size-4"
                    />
                  </button>
                  <HeaderIcon icon={SettingsIcon} />
                  <HeaderIcon icon={NotificationIcon} />
                  <HeaderIcon icon={UserIcon} />
                </div>
              </div>

              <div className="mt-2 flex gap-2 overflow-auto pb-1 lg:hidden">
                {mobileQuickMenus.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="bg-background text-foreground/70 rounded-full px-2.5 py-1 text-xs"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </header>

            <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-7">
              {children}
            </main>
          </div>

          <aside className="border-border bg-card hidden h-full overflow-y-auto border-l p-4 2xl:block">
            <RightPanelSection title="Notifications">
              {notifications.map((item) => (
                <ActivityItem
                  key={item.title + item.time}
                  title={item.title}
                  time={item.time}
                />
              ))}
            </RightPanelSection>

            <RightPanelSection title="Activities">
              {activities.map((item) => (
                <ActivityItem
                  key={item.title + item.time}
                  title={item.title}
                  time={item.time}
                />
              ))}
            </RightPanelSection>

            <RightPanelSection title="Contacts">
              <div className="space-y-2">
                {contacts.map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-2.5 rounded-lg px-1 py-1.5"
                  >
                    <Avatar name={name} />
                    <span className="text-sm text-[#1f2937]">{name}</span>
                  </div>
                ))}
              </div>
            </RightPanelSection>

            <div className="bg-muted/60 text-muted-foreground mt-4 grid place-items-center rounded-xl p-3 text-xs">
              <div className="mb-1 grid size-6 place-content-center rounded-md bg-[#4c8dff] text-[11px] font-semibold text-white">
                s
              </div>
              snowUI
            </div>
          </aside>
        </div>
      </div>
    </div>
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

function RightPanelSection({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <section className="mb-6">
      <h3 className="text-foreground mb-2 text-sm font-medium">{title}</h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function ActivityItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="rounded-lg px-1 py-1.5">
      <p className="text-foreground text-sm">{title}</p>
      <p className="text-muted-foreground text-xs">{time}</p>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="grid size-7 place-content-center rounded-full bg-gradient-to-br from-sky-200 to-indigo-300 text-[10px] font-semibold text-[#1f2937]">
      {initials}
    </div>
  );
}
