import type { ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { cn } from "@/shared/lib/utils";
import type { SidebarMenuItem } from "../types";
import { SidebarActionMenu } from "./SidebarActionMenu";

type IconType = ComponentProps<typeof HugeiconsIcon>["icon"];

type SidebarItemProps = {
  item: SidebarMenuItem;
};

export function SidebarItem({ item }: SidebarItemProps) {
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
