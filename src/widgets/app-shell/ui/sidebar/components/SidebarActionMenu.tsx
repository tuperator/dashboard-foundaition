import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import type { SidebarAction } from "../types";

type SidebarActionMenuProps = {
  actions?: SidebarAction[];
};

export function SidebarActionMenu({ actions = [] }: SidebarActionMenuProps) {
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
              className={cn(action.destructive && "text-red-600 focus:text-red-600")}
            >
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
