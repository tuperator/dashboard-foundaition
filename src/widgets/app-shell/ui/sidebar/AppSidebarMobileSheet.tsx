import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu02Icon } from "@hugeicons/core-free-icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/ui/sheet";
import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
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

export function AppSidebarMobileSheet() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={t("sidebar.mobile.title")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          "text-foreground/70 hover:bg-muted hover:text-foreground grid h-8 w-8 place-content-center rounded-lg transition",
          open && "bg-muted text-foreground",
        )}
      >
        <HugeiconsIcon icon={Menu02Icon} className="size-4" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-[280px] max-w-[88vw] border-r border-[color:var(--sb-border)] bg-[var(--sb-bg)] p-0 sm:max-w-[280px]"
        >
          <SheetTitle className="sr-only">{t("sidebar.mobile.title")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("sidebar.mobile.description")}
          </SheetDescription>
          <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
              <div className="mb-4">
                <SidebarBrand profileName={sidebarProfileName} />
              </div>
              <SidebarTabs tabs={sidebarTabs} />
              <SidebarFavorites items={sidebarFavorites} />
              <SidebarSections sections={sidebarSections} />
            </div>

            <SidebarFooter />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
