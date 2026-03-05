import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/shared/ui/sheet";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { Switch } from "@/shared/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import type {
  Branch,
  CreateUserPayload,
  Gender,
  UserRole,
  UserStatus,
} from "../../model/types";

type CreateUserSheetProps = {
  open: boolean;
  roleOptions: UserRole[];
  branchOptions: Branch[];
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateUserPayload) => void;
};

type CreateUserFormState = {
  username: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  gender: Gender | "UNKNOWN";
  status: UserStatus;
  roleIds: string[];
  branchIds: string[];
  twoFactorEnabled: boolean;
};

const INITIAL_FORM: CreateUserFormState = {
  username: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  gender: "UNKNOWN",
  status: "WORKING",
  roleIds: [],
  branchIds: [],
  twoFactorEnabled: true,
};

export function CreateUserSheet({
  open,
  roleOptions,
  branchOptions,
  submitting = false,
  onOpenChange,
  onSubmit,
}: CreateUserSheetProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<CreateUserFormState>(INITIAL_FORM);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
    [form.email],
  );
  const passwordValid = form.password.length >= 8;

  const canSubmit =
    form.username.trim().length > 0 &&
    emailValid &&
    passwordValid &&
    form.roleIds.length > 0 &&
    form.branchIds.length > 0;

  const toggleRole = (roleId: string, checked: boolean) => {
    setForm((prev) => {
      if (checked) {
        return { ...prev, roleIds: [...prev.roleIds, roleId] };
      }
      return { ...prev, roleIds: prev.roleIds.filter((id) => id !== roleId) };
    });
  };

  const toggleBranch = (branchId: string, checked: boolean) => {
    setForm((prev) => {
      if (checked) {
        return { ...prev, branchIds: [...prev.branchIds, branchId] };
      }
      return {
        ...prev,
        branchIds: prev.branchIds.filter((id) => id !== branchId),
      };
    });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setForm(INITIAL_FORM);
        }
        onOpenChange(nextOpen);
      }}
    >
      <SheetContent
        side="right"
        className="w-[520px] max-w-[95vw] [zoom:var(--app-scale)] sm:max-w-[520px]"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="space-y-1 border-b px-5 py-4">
            <SheetTitle className="text-base">{t("users.create.title")}</SheetTitle>
            <SheetDescription>{t("users.create.description")}</SheetDescription>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="create-username">{t("users.profile.fullName")}</Label>
                <Input
                  id="create-username"
                  value={form.username}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, username: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-email">{t("users.profile.email")}</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
                {!emailValid && form.email.trim().length > 0 ? (
                  <p className="text-destructive text-[11px]">
                    {t("users.create.error.invalidEmail")}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-password">{t("users.password.new")}</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  placeholder={t("users.password.placeholder.new")}
                />
                {!passwordValid && form.password.length > 0 ? (
                  <p className="text-destructive text-[11px]">
                    {t("users.password.error.min8")}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-phone">{t("users.profile.phone")}</Label>
                <Input
                  id="create-phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-address">{t("users.profile.address")}</Label>
                <Input
                  id="create-address"
                  value={form.address}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, address: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>{t("users.profile.gender")}</Label>
                <Select
                  value={form.gender}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, gender: value as Gender | "UNKNOWN" }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNKNOWN">
                      {t("users.profile.gender.unknown")}
                    </SelectItem>
                    <SelectItem value="MALE">{t("users.profile.gender.male")}</SelectItem>
                    <SelectItem value="FEMALE">
                      {t("users.profile.gender.female")}
                    </SelectItem>
                    <SelectItem value="OTHER">
                      {t("users.profile.gender.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{t("users.profile.status")}</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, status: value as UserStatus }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORKING">{t("users.status.working")}</SelectItem>
                    <SelectItem value="ONLEAVE">{t("users.status.onLeave")}</SelectItem>
                    <SelectItem value="RESIGNED">{t("users.status.resigned")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t("users.profile.roles")}</Label>
              <div className="grid gap-2 rounded-xl border bg-input/20 p-3">
                {roleOptions.map((role) => (
                  <label key={role.id} className="inline-flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={form.roleIds.includes(role.id)}
                      onCheckedChange={(checked) => toggleRole(role.id, Boolean(checked))}
                    />
                    {role.roleName}
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t("users.profile.branches")}</Label>
              <div className="grid gap-2 rounded-xl border bg-input/20 p-3">
                {branchOptions.map((branch) => (
                  <label
                    key={branch.id}
                    className="inline-flex items-center justify-between gap-2 text-xs"
                  >
                    <span>{branch.name}</span>
                    <Checkbox
                      checked={form.branchIds.includes(branch.id)}
                      onCheckedChange={(checked) =>
                        toggleBranch(branch.id, Boolean(checked))
                      }
                    />
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-3 rounded-xl border bg-input/20 px-3 py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  {t("users.profile.twoFactor.title")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("users.profile.twoFactor.description")}
                </p>
              </div>
              <Switch
                checked={form.twoFactorEnabled}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, twoFactorEnabled: checked }))
                }
              />
            </div>
          </div>

          <div className="mt-auto flex items-center justify-end gap-2 border-t px-5 py-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("users.common.cancel")}
            </Button>
            <Button
              disabled={!canSubmit || submitting}
              onClick={() =>
                onSubmit({
                  username: form.username.trim(),
                  email: form.email.trim(),
                  password: form.password,
                  phone: form.phone.trim() || null,
                  address: form.address.trim() || null,
                  gender: form.gender === "UNKNOWN" ? null : form.gender,
                  status: form.status,
                  roleIds: form.roleIds,
                  branchIds: form.branchIds,
                  twoFactorEnabled: form.twoFactorEnabled,
                })
              }
            >
              {submitting ? `${t("users.create.submit")}...` : t("users.create.submit")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
