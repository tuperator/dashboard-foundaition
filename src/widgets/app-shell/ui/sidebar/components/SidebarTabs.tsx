import { cn } from "@/shared/lib/utils";

type SidebarTabsProps = {
  tabs: readonly string[];
  activeIndex?: number;
};

export function SidebarTabs({ tabs, activeIndex = 0 }: SidebarTabsProps) {
  return (
    <div className="mb-3 flex items-center gap-6 px-2 text-[var(--sb-muted)]">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          className={cn(
            "relative pb-1 transition",
            index === activeIndex
              ? "text-[var(--sb-text)]"
              : "hover:text-[var(--sb-text)]",
          )}
        >
          {tab}
          {index === activeIndex ? (
            <span className="absolute bottom-0 left-0 h-px w-full bg-[var(--sb-indicator)]" />
          ) : null}
        </button>
      ))}
    </div>
  );
}
