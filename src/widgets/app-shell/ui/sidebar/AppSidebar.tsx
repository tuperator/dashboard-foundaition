import type { ComponentProps } from "react";
import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import type { TranslationKey } from "@/shared/i18n/messages";
import {
  sidebarFavorites,
  sidebarProfileName,
  sidebarSections,
  sidebarTabs,
} from "../../model/sidebarMenuData";
import {
  SidebarBrand,
  SidebarFavorites,
  SidebarFooter,
  SidebarSections,
  SidebarTabs,
} from "./components";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";

type IconType = ComponentProps<typeof HugeiconsIcon>["icon"];

type AppSidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function AppSidebar({ collapsed, onToggleCollapsed }: AppSidebarProps) {
  const { t } = useI18n();
  const collapsedItems = useMemo(
    () =>
      sidebarSections
        .flatMap((section) => section.items)
        .filter((item) => Boolean(item.icon))
        .map((item) => ({
          labelKey: item.labelKey,
          icon: item.icon as IconType,
          to: item.to || item.children?.[0]?.to || "",
          matchMode: item.matchMode,
        })),
    [],
  );

  return (
    <aside className="figma-14-regular hidden h-full w-[var(--sb-layout-width)] shrink-0 overflow-hidden border-r border-[color:var(--sb-border)] bg-[var(--sb-bg)] motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-in-out lg:sticky lg:top-0 lg:block">
      <div className="flex h-full min-h-0 flex-col">
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto motion-safe:transition-[padding] motion-safe:duration-300 motion-safe:ease-in-out",
            collapsed ? "px-1.5 py-2.5" : "px-3 py-4",
          )}
        >
          {collapsed ? (
            <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200">
              <CollapsedSidebarContent
                items={collapsedItems}
                translate={t}
                onToggleCollapsed={onToggleCollapsed}
              />
            </div>
          ) : (
            <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200">
              <div className="mb-4 flex items-center justify-between gap-2">
                <SidebarBrand profileName={sidebarProfileName} />
                <ToggleButton
                  collapsed={collapsed}
                  onToggleCollapsed={onToggleCollapsed}
                />
              </div>
              <SidebarTabs tabs={sidebarTabs} />
              <SidebarFavorites items={sidebarFavorites} />
              <SidebarSections sections={sidebarSections} />
            </div>
          )}
        </div>

        <SidebarFooter collapsed={collapsed} />
      </div>
    </aside>
  );
}

function CollapsedSidebarContent({
  items,
  translate,
  onToggleCollapsed,
}: {
  items: {
    labelKey: TranslationKey;
    icon: IconType;
    to: string;
    matchMode?: "exact" | "prefix";
  }[];
  translate: (key: TranslationKey) => string;
  onToggleCollapsed: () => void;
}) {
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex h-full flex-col">
        <div className="mb-3 flex justify-center">
          <ToggleButton collapsed onToggleCollapsed={onToggleCollapsed} />
        </div>

        <div className="mx-auto w-full max-w-[40px] space-y-1.5">
          {items.map((item) => (
            <Tooltip key={item.labelKey}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to || "#"}
                  end={item.matchMode !== "prefix"}
                  className={cn(
                    "grid h-10 w-10 place-content-center rounded-xl text-[var(--sb-rail-icon)] transition",
                    isCollapsedItemActive(
                      location.pathname,
                      item.to,
                      item.matchMode,
                    )
                      ? "bg-[var(--sb-rail-active-bg)] text-[var(--sb-rail-active-icon)]"
                      : "hover:bg-[var(--sb-rail-hover)]",
                  )}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    strokeWidth={2}
                    className="size-5"
                  />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={8}
                className="rounded-xl px-3 py-1.5 text-xs font-medium [--tooltip-bg:#111827] [--tooltip-fg:#ffffff]"
              >
                {translate(item.labelKey)}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

function isCollapsedItemActive(
  pathname: string,
  to: string,
  matchMode: "exact" | "prefix" = "exact",
) {
  if (!to) {
    return false;
  }

  const normalizedPath = normalizePath(pathname);
  const normalizedTo = normalizePath(to);

  if (normalizedTo === "/") {
    return normalizedPath === "/";
  }

  if (matchMode === "prefix") {
    return (
      normalizedPath === normalizedTo ||
      normalizedPath.startsWith(`${normalizedTo}/`)
    );
  }

  return normalizedPath === normalizedTo;
}

function normalizePath(value: string) {
  if (!value || value === "/") {
    return "/";
  }
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function ToggleButton({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onClick={onToggleCollapsed}
      className="grid h-7 w-7 shrink-0 place-content-center rounded-lg text-[var(--sb-icon)] transition hover:bg-[var(--sb-hover)] hover:text-[var(--sb-text)]"
    >
      <HugeiconsIcon
        icon={collapsed ? ArrowRight01Icon : ArrowLeft01Icon}
        strokeWidth={2}
        className="size-3.5 motion-safe:transition-transform motion-safe:duration-200"
      />
    </button>
  );
}
