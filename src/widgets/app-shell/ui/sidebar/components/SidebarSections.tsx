import type { SidebarSection } from "../types";
import { SidebarItem } from "./SidebarItem";

type SidebarSectionsProps = {
  sections: SidebarSection[];
};

export function SidebarSections({ sections }: SidebarSectionsProps) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.title}>
          <h3 className="mb-2 px-2 text-[var(--sb-muted)]">{section.title}</h3>
          <div className="space-y-1">
            {section.items.map((item) => (
              <SidebarItem key={item.label} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
