import type { SidebarSection } from "../types";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { SidebarItem } from "./SidebarItem";

type SidebarSectionsProps = {
  sections: SidebarSection[];
};

export function SidebarSections({ sections }: SidebarSectionsProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.titleKey}>
          <h3 className="mb-2 px-2 text-[var(--sb-muted)]">
            {t(section.titleKey)}
          </h3>
          <div className="space-y-1">
            {section.items.map((item) => (
              <SidebarItem key={item.labelKey} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
