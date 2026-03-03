import type { SidebarSimpleItem } from "../types";

type SidebarFavoritesProps = {
  items: SidebarSimpleItem[];
};

export function SidebarFavorites({ items }: SidebarFavoritesProps) {
  return (
    <div className="mb-6 space-y-1">
      {items.map((item) => (
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
  );
}
