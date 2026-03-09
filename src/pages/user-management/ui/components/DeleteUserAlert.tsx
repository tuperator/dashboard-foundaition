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
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import type { UserAccount } from "../../model/types";

type DeleteUserAlertProps = {
  open: boolean;
  user: UserAccount | null;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function DeleteUserAlert({
  open,
  user,
  submitting = false,
  onOpenChange,
  onConfirm,
}: DeleteUserAlertProps) {
  const { t, tp } = useI18n();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm" className="[zoom:var(--app-scale)]">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("users.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {tp("users.delete.description", {
              name: user?.username || t("users.common.unknownUser"),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm">
            {t("users.common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting
              ? `${t("users.delete.confirm")}...`
              : t("users.delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
