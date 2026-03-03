import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  MoreHorizontalCircle01Icon,
} from "@hugeicons/core-free-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  sidebarFavorites,
  sidebarProfileName,
  sidebarSections,
  sidebarTabs,
} from "./sidebar.data";
import { cn } from "@/shared/lib/utils";
import type { SidebarAction, SidebarMenuItem } from "./types";

type IconType = React.ComponentProps<typeof HugeiconsIcon>["icon"];

export function AppSidebar() {
  return (
    <aside className="figma-14-regular hidden h-full w-[var(--sb-width)] shrink-0 overflow-hidden border-r border-[color:var(--sb-border)] bg-[var(--sb-bg)] lg:sticky lg:top-0 lg:block">
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-4 flex h-10 items-center gap-2 rounded-xl px-2">
            <div className="grid size-8 place-content-center rounded-full bg-gradient-to-br from-[var(--sb-avatar-from)] to-[var(--sb-avatar-to)] text-[var(--sb-avatar-text)]">
              B
            </div>
            <p className="truncate text-[15px] font-medium text-[var(--sb-text)]">
              {sidebarProfileName}
            </p>
          </div>

          <div className="mb-3 flex items-center gap-6 px-2 text-[var(--sb-muted)]">
            {sidebarTabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={cn(
                  "relative pb-1 transition",
                  index === 0
                    ? "text-[var(--sb-text)]"
                    : "hover:text-[var(--sb-text)]",
                )}
              >
                {tab}
                {index === 0 ? (
                  <span className="absolute bottom-0 left-0 h-px w-full bg-[var(--sb-indicator)]" />
                ) : null}
              </button>
            ))}
          </div>

          <div className="mb-6 space-y-1">
            {sidebarFavorites.map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex h-[var(--sb-item-height)] w-full items-center gap-3 rounded-xl px-3 text-left text-[var(--sb-text)] transition hover:bg-[var(--sb-hover)]"
              >
                <span className="size-1.5 rounded-full bg-[var(--sb-indicator)]" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {sidebarSections.map((section) => (
              <section key={section.title}>
                <h3 className="mb-2 px-2 text-[var(--sb-muted)]">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarItem key={item.label} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="relative shrink-0 px-3 pt-8 pb-5">
          <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-b from-transparent to-[var(--sb-bg)]" />
          <div className="grid place-items-center text-[var(--sb-logo-text)]">
            <div className="flex items-center gap-2 text-[12px] font-medium tracking-[0.06em]">
              <span className="text-[var(--sb-logo-star)]">*</span>
              <span>snow</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ item }: { item: SidebarMenuItem }) {
  const hasChildren = Boolean(item.children?.length);
  const hasArrow = item.expandable || hasChildren;

  if (hasChildren) {
    return (
      <Collapsible
        defaultOpen={Boolean(item.expanded)}
        className="group/collapse"
      >
        <div className="group/item relative">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className={cn(
                "relative flex h-[var(--sb-item-height)] w-full items-center rounded-xl pr-9 text-left text-[var(--sb-text)] transition",
                item.active
                  ? "bg-[var(--sb-active)]"
                  : "hover:bg-[var(--sb-hover)]",
              )}
            >
              {item.active ? (
                <span className="absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-[3px] bg-[var(--sb-indicator)]" />
              ) : null}

              <span className="mr-1 ml-2 inline-grid size-4 shrink-0 place-content-center text-[var(--sb-icon)]">
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="size-4 transition-transform group-data-[state=open]/collapse:rotate-90"
                />
              </span>

              <span className="mx-1 inline-grid size-8 shrink-0 place-content-center text-[var(--sb-icon)]">
                {item.icon ? (
                  <HugeiconsIcon
                    icon={item.icon as IconType}
                    strokeWidth={2}
                    className="size-5"
                  />
                ) : null}
              </span>

              <span className="truncate">{item.label}</span>
            </button>
          </CollapsibleTrigger>

          <SidebarActionMenu actions={item.actions} />
        </div>

        <CollapsibleContent>
          <div className="mt-1 space-y-1 pr-2 pl-11">
            {item.children?.map((child) => (
              <button
                key={child}
                type="button"
                className="flex h-[var(--sb-subitem-height)] w-full items-center rounded-lg px-2 text-left text-[var(--sb-text)] transition hover:bg-[var(--sb-hover)]"
              >
                {child}
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className="group/item relative">
      <button
        type="button"
        className={cn(
          "relative flex h-[var(--sb-item-height)] w-full items-center rounded-xl pr-9 text-left text-[var(--sb-text)] transition",
          item.active ? "bg-[var(--sb-active)]" : "hover:bg-[var(--sb-hover)]",
        )}
      >
        {item.active ? (
          <span className="absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-[3px] bg-[var(--sb-indicator)]" />
        ) : null}

        {hasArrow ? (
          <span className="mr-1 ml-2 inline-grid size-4 shrink-0 place-content-center text-[var(--sb-icon)]">
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-4"
            />
          </span>
        ) : null}

        <span
          className={cn(
            "mx-1 inline-grid size-8 shrink-0 place-content-center text-[var(--sb-icon)]",
            !hasArrow && "ml-4",
          )}
        >
          {item.icon ? (
            <HugeiconsIcon
              icon={item.icon as IconType}
              strokeWidth={2}
              className="size-5"
            />
          ) : null}
        </span>

        <span className="truncate">{item.label}</span>
      </button>

      <SidebarActionMenu actions={item.actions} />
    </div>
  );
}

function SidebarActionMenu({ actions = [] }: { actions?: SidebarAction[] }) {
  if (!actions.length) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="pointer-events-none absolute top-1/2 right-1 grid size-7 -translate-y-1/2 scale-95 place-content-center rounded-md text-[var(--sb-action)] opacity-0 transition group-hover/item:pointer-events-auto group-hover/item:scale-100 group-hover/item:opacity-100 hover:bg-[var(--sb-hover)] hover:text-[var(--sb-action-hover)] focus:pointer-events-auto focus:scale-100 focus:opacity-100"
        >
          <HugeiconsIcon
            icon={MoreHorizontalCircle01Icon}
            strokeWidth={2}
            className="size-[18px]"
          />
          <span className="sr-only">Open item actions</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" className="w-40 rounded-lg">
        {actions.map((action, index) => (
          <div key={action.label}>
            {index > 0 && action.destructive ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              className={cn(
                action.destructive && "text-red-600 focus:text-red-600",
              )}
            >
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
