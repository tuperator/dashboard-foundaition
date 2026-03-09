import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import type { UserAccount } from "../../model/types";

type UserPasswordDialogProps = {
  open: boolean;
  user: UserAccount | null;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (newPassword: string) => void;
};

export function UserPasswordDialog({
  open,
  user,
  submitting = false,
  onOpenChange,
  onSubmit,
}: UserPasswordDialogProps) {
  const { t } = useI18n();

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="[zoom:var(--app-scale)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("users.password.title")}</DialogTitle>
            <DialogDescription>{t("users.error.notFound")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("users.common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <PasswordDialogContent
      key={user.id}
      open={open}
      user={user}
      submitting={submitting}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
    />
  );
}

function PasswordDialogContent({
  open,
  user,
  submitting = false,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  user: UserAccount;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (newPassword: string) => void;
}) {
  const { t, tp } = useI18n();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  let passwordError = "";
  if (newPassword || confirmPassword) {
    if (newPassword.length < 8) {
      passwordError = t("users.password.error.min8");
    } else if (newPassword !== confirmPassword) {
      passwordError = t("users.password.error.notMatch");
    }
  }

  const canSubmit =
    newPassword.length > 0 && confirmPassword.length > 0 && !passwordError;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setNewPassword("");
          setConfirmPassword("");
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="[zoom:var(--app-scale)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("users.password.title")}</DialogTitle>
          <DialogDescription>
            {tp("users.password.description", {
              name: user?.username || t("users.common.unknownUser"),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">{t("users.password.new")}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder={t("users.password.placeholder.new")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">
              {t("users.password.confirm")}
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={t("users.password.placeholder.confirm")}
            />
          </div>

          {passwordError ? (
            <p className="text-destructive text-xs">{passwordError}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("users.common.cancel")}
          </Button>
          <Button
            disabled={!canSubmit || submitting}
            onClick={() => onSubmit(newPassword)}
          >
            {submitting
              ? `${t("users.password.submit")}...`
              : t("users.password.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
