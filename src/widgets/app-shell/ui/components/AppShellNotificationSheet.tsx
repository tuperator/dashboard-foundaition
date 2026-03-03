import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MailIcon,
  NotificationIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/ui/sheet";
import { cn } from "@/shared/lib/utils";

type FeedItem = {
  title: string;
  time: string;
};

type AppShellNotificationSheetProps = {
  notifications: FeedItem[];
  activities: FeedItem[];
  contacts: string[];
};

const notificationIcons = [
  NotificationIcon,
  UserIcon,
  NotificationIcon,
  MailIcon,
];
const activityAvatarTone = [
  "from-[#f4a7b9] to-[#7b9cfb]",
  "from-[#f6c66a] to-[#f58a6d]",
  "from-[#9dd6ff] to-[#6b8cff]",
  "from-[#f5b5b5] to-[#c98ce5]",
  "from-[#8de0e7] to-[#5d85e6]",
  "from-[#c4c7cf] to-[#8f95a4]",
];

export function AppShellNotificationSheet({
  notifications,
  activities,
  contacts,
}: AppShellNotificationSheetProps) {
  const [open, setOpen] = useState(false);

  const notificationData = useMemo(
    () =>
      notifications.map((item, index) => ({
        ...item,
        icon: notificationIcons[index % notificationIcons.length],
      })),
    [notifications],
  );

  return (
    <>
      <button
        type="button"
        aria-label="Toggle notifications sheet"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "text-foreground/65 hover:bg-muted hover:text-foreground relative grid h-7 w-7 place-content-center rounded-md transition",
          open && "bg-muted text-foreground",
        )}
      >
        <HugeiconsIcon icon={NotificationIcon} className="size-4" />
        {notifications.length > 0 ? (
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-[var(--dash-dot-secondary)]" />
        ) : null}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="border-border bg-card w-[320px] max-w-[88vw] rounded-l-[28px] border-l p-0 [zoom:var(--app-scale)] sm:max-w-[320px]"
        >
          <div className="h-full overflow-y-auto px-5 pt-6 pb-5">
            <SheetTitle className="mb-4 text-lg font-medium tracking-[-0.01em]">
              Notifications
            </SheetTitle>
            <SheetDescription className="sr-only">
              Recent notifications, activities, and contacts.
            </SheetDescription>

            <div className="space-y-3">
              {notificationData.map((item) => (
                <div key={item.title + item.time} className="flex gap-3">
                  <div className="bg-muted text-foreground/80 mt-0.5 grid size-8 shrink-0 place-content-center rounded-xl">
                    <HugeiconsIcon icon={item.icon} className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-[15px] leading-6">
                      {item.title}
                    </p>
                    <p className="text-muted-foreground text-xs leading-5">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <section className="mt-7">
              <h3 className="text-foreground mb-3 text-xl leading-7">
                Activities
              </h3>
              <div className="space-y-3">
                {activities.map((item, index) => (
                  <div
                    key={item.title + item.time}
                    className="relative flex gap-3"
                  >
                    <div
                      className={cn(
                        "relative z-10 grid size-8 shrink-0 place-content-center rounded-full bg-gradient-to-br text-[11px] font-semibold text-white",
                        activityAvatarTone[index % activityAvatarTone.length],
                      )}
                    >
                      {item.title[0]}
                    </div>
                    {index < activities.length - 1 ? (
                      <span className="bg-border absolute top-8 left-4 h-[28px] w-px" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="text-foreground truncate text-[15px] leading-6">
                        {item.title}
                      </p>
                      <p className="text-muted-foreground text-xs leading-5">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-7">
              <h3 className="text-foreground mb-3 text-xl leading-7">
                Contacts
              </h3>
              <div className="space-y-3">
                {contacts.map((name, index) => (
                  <div key={name} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "grid size-8 shrink-0 place-content-center rounded-full bg-gradient-to-br text-[11px] font-semibold text-white",
                        activityAvatarTone[
                          (index + 2) % activityAvatarTone.length
                        ],
                      )}
                    >
                      {name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <p className="text-foreground truncate text-[15px] leading-6">
                      {name}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
