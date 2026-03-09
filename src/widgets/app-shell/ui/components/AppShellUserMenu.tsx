import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  HelpCircleIcon,
  Logout02Icon,
  ProfileIcon,
  SecurityLockIcon,
  SettingsIcon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { appRoutes } from "@/shared/constants/routes";
import { clearAuthSession, getAuthSession } from "@/shared/lib/auth-session";
import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

type AppShellUserMenuProps = {
  ariaLabel: string;
};

const triggerBaseClassName =
  "text-foreground/65 hover:bg-muted hover:text-foreground grid h-7 w-7 place-content-center rounded-md transition";

export function AppShellUserMenu({ ariaLabel }: AppShellUserMenuProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const session = getAuthSession();
  const displayName = session?.username || t("app.userMenu.guest");
  const email = session?.email || "";

  const openSettingsSection = (
    section: "general" | "security" | "appearance",
  ) => {
    navigate(`${appRoutes.settings}#${section}`);
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate(appRoutes.login, { replace: true });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            triggerBaseClassName,
            open && "bg-muted text-foreground",
          )}
        >
          <HugeiconsIcon icon={UserIcon} className="size-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-xl p-1.5 [zoom:var(--app-scale)]"
      >
        <DropdownMenuLabel className="px-2 py-2">
          <p className="text-foreground text-sm leading-5 font-medium">
            {displayName}
          </p>
          {email ? (
            <p className="text-muted-foreground text-[11px] leading-4">
              {t("app.userMenu.signedInAs")}: {email}
            </p>
          ) : null}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => openSettingsSection("general")}>
          <HugeiconsIcon icon={ProfileIcon} className="size-4" />
          {t("app.userMenu.profileSettings")}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => navigate(appRoutes.users)}>
          <HugeiconsIcon icon={UserGroupIcon} className="size-4" />
          {t("app.userMenu.userManagement")}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => openSettingsSection("security")}>
          <HugeiconsIcon icon={SecurityLockIcon} className="size-4" />
          {t("app.userMenu.securitySettings")}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => openSettingsSection("appearance")}>
          <HugeiconsIcon icon={SettingsIcon} className="size-4" />
          {t("app.userMenu.appearanceSettings")}
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => window.open("mailto:support@tuperator.com", "_blank")}
        >
          <HugeiconsIcon icon={HelpCircleIcon} className="size-4" />
          {t("app.userMenu.helpSupport")}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onSelect={() => setConfirmLogoutOpen(true)}
        >
          <HugeiconsIcon icon={Logout02Icon} className="size-4" />
          {t("app.userMenu.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>

      <AlertDialog open={confirmLogoutOpen} onOpenChange={setConfirmLogoutOpen}>
        <AlertDialogContent
          size="sm"
          className="[zoom:var(--app-scale)] data-[size=sm]:max-w-60"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("app.userMenu.logoutConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("app.userMenu.logoutConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">
              {t("app.userMenu.logoutConfirmCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              variant="destructive"
              onClick={handleLogout}
            >
              {t("app.userMenu.logoutConfirmAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DropdownMenu>
  );
}
