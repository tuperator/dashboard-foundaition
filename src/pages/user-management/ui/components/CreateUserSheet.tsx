import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/ui/sheet";
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
  UserUnknownGender,
  UserUnassignedBranch,
  UserRole,
  UserStatus,
} from "../../model/types";
import {
  USER_DEFAULT_CREATE_STATUS,
  USER_FORM_EMAIL_REGEX,
  USER_PASSWORD_MIN_LENGTH,
  USER_SHEET_CONTENT_CLASS,
  USER_UNASSIGNED_BRANCH,
} from "../../model/constants";
import {
  USER_STATUS_VALUES,
  USER_UNKNOWN_GENDER_VALUE,
  USER_UNASSIGNED_BRANCH_VALUE,
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
  gender: Gender | UserUnknownGender;
  status: UserStatus;
  roleIds: string[];
  branchId: string | UserUnassignedBranch;
  twoFactorEnabled: boolean;
};

const INITIAL_FORM: CreateUserFormState = {
  username: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  gender: USER_UNKNOWN_GENDER_VALUE,
  status: USER_DEFAULT_CREATE_STATUS,
  roleIds: [],
  branchId: USER_UNASSIGNED_BRANCH_VALUE,
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
    () => USER_FORM_EMAIL_REGEX.test(form.email.trim()),
    [form.email],
  );
  const passwordValid = form.password.length >= USER_PASSWORD_MIN_LENGTH;

  const canSubmit =
    form.username.trim().length > 0 &&
    emailValid &&
    passwordValid &&
    form.phone.trim().length > 0 &&
    form.address.trim().length > 0 &&
    form.gender !== USER_UNKNOWN_GENDER_VALUE &&
    form.roleIds.length > 0 &&
    form.branchId !== USER_UNASSIGNED_BRANCH;

  const toggleRole = (roleId: string, checked: boolean) => {
    setForm((prev) => {
      if (checked) {
        return { ...prev, roleIds: [...prev.roleIds, roleId] };
      }
      return { ...prev, roleIds: prev.roleIds.filter((id) => id !== roleId) };
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
      <SheetContent side="right" className={USER_SHEET_CONTENT_CLASS}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="space-y-1 border-b px-5 py-4">
            <SheetTitle className="text-base">
              {t("users.create.title")}
            </SheetTitle>
            <SheetDescription>{t("users.create.description")}</SheetDescription>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="create-username">
                  {t("users.profile.fullName")}
                </Label>
                <Input
                  id="create-username"
                  value={form.username}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      username: event.target.value,
                    }))
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
                <Label htmlFor="create-password">
                  {t("users.password.new")}
                </Label>
                <Input
                  id="create-password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
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
                <Label htmlFor="create-address">
                  {t("users.profile.address")}
                </Label>
                <Input
                  id="create-address"
                  value={form.address}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      address: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>{t("users.profile.gender")}</Label>
                <Select
                  value={form.gender}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      gender: value as Gender | UserUnknownGender,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={USER_UNKNOWN_GENDER_VALUE}>
                      {t("users.profile.gender.unknown")}
                    </SelectItem>
                    <SelectItem value="MALE">
                      {t("users.profile.gender.male")}
                    </SelectItem>
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
                    setForm((prev) => ({
                      ...prev,
                      status: value as UserStatus,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_STATUS_VALUES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "WORKING"
                          ? t("users.status.working")
                          : status === "ONLEAVE"
                            ? t("users.status.onLeave")
                            : t("users.status.resigned")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t("users.profile.roles")}</Label>
              <div className="bg-input/20 grid gap-2 rounded-xl border p-3">
                {roleOptions.map((role) => (
                  <label
                    key={role.id}
                    className="inline-flex items-center gap-2 text-xs"
                  >
                    <Checkbox
                      checked={form.roleIds.includes(role.id)}
                      onCheckedChange={(checked) =>
                        toggleRole(role.id, Boolean(checked))
                      }
                    />
                    {role.roleName}
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t("users.profile.branches")}</Label>
              <Select
                value={form.branchId}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    branchId: value as string | UserUnassignedBranch,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={USER_UNASSIGNED_BRANCH}>
                    {t("users.branch.selectPlaceholder")}
                  </SelectItem>
                  {branchOptions.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="bg-input/20 flex items-center justify-between gap-3 rounded-xl border px-3 py-2">
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
                  phone: form.phone.trim(),
                  address: form.address.trim(),
                  gender:
                    form.gender === USER_UNKNOWN_GENDER_VALUE
                      ? null
                      : form.gender,
                  status: form.status,
                  roleIds: form.roleIds,
                  branchId:
                    form.branchId === USER_UNASSIGNED_BRANCH
                      ? null
                      : form.branchId,
                  twoFactorEnabled: form.twoFactorEnabled,
                })
              }
            >
              {submitting
                ? `${t("users.create.submit")}...`
                : t("users.create.submit")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
