import { NavLink } from "react-router-dom";
import type { SidebarSimpleItem } from "../types";
import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";

type SidebarFavoritesProps = {
  items: SidebarSimpleItem[];
};

export function SidebarFavorites({ items }: SidebarFavoritesProps) {
  const { t } = useI18n();

  return (
    <div className="mb-6 space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.labelKey}
          to={item.to}
          end={item.matchMode !== "prefix"}
          className={({ isActive }) =>
            cn(
              "flex h-[var(--sb-item-height)] w-full items-center gap-3 rounded-xl px-3 text-left text-[var(--sb-text)] transition hover:bg-[var(--sb-hover)]",
              isActive && "bg-[var(--sb-active)]",
            )
          }
        >
          <span className="size-1.5 rounded-full bg-[var(--sb-indicator)]" />
          {t(item.labelKey)}
        </NavLink>
      ))}
    </div>
  );
}
