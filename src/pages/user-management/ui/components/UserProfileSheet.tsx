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
  Gender,
  UpdateUserProfilePayload,
  UserAccount,
  UserUnknownGender,
  UserUnassignedBranch,
  UserRole,
} from "../../model/types";
import {
  USER_SHEET_CONTENT_CLASS,
  USER_UNASSIGNED_BRANCH,
} from "../../model/constants";
import {
  USER_UNKNOWN_GENDER_VALUE,
  USER_UNASSIGNED_BRANCH_VALUE,
} from "../../model/types";

type UserProfileSheetProps = {
  open: boolean;
  user: UserAccount | null;
  roleOptions: UserRole[];
  branchOptions: Branch[];
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: UpdateUserProfilePayload) => void;
};

type ProfileFormState = {
  username: string;
  email: string;
  phone: string;
  address: string;
  gender: Gender | UserUnknownGender;
  roleIds: string[];
  branchId: string | UserUnassignedBranch;
};

export function UserProfileSheet({
  open,
  user,
  roleOptions,
  branchOptions,
  submitting = false,
  onOpenChange,
  onSubmit,
}: UserProfileSheetProps) {
  const { t } = useI18n();

  if (!user) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className={USER_SHEET_CONTENT_CLASS}>
          <div className="space-y-1 border-b px-5 py-4">
            <SheetTitle className="text-base">
              {t("users.profile.title")}
            </SheetTitle>
            <SheetDescription>{t("users.error.notFound")}</SheetDescription>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <UserProfileFormContent
      key={user.id}
      open={open}
      user={user}
      roleOptions={roleOptions}
      branchOptions={branchOptions}
      submitting={submitting}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
    />
  );
}

function UserProfileFormContent({
  open,
  user,
  roleOptions,
  branchOptions,
  submitting = false,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  user: UserAccount;
  roleOptions: UserRole[];
  branchOptions: Branch[];
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: UpdateUserProfilePayload) => void;
}) {
  const { t } = useI18n();

  const initialFormState: ProfileFormState = useMemo(
    () => ({
      username: user.username,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      gender: user.gender || USER_UNKNOWN_GENDER_VALUE,
      roleIds: user.roles.map((role) => role.id),
      branchId: user.branchId || USER_UNASSIGNED_BRANCH_VALUE,
    }),
    [user],
  );

  const [form, setForm] = useState<ProfileFormState>(initialFormState);

  const canSubmit = useMemo(
    () =>
      form.username.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      form.address.trim() &&
      form.gender !== USER_UNKNOWN_GENDER_VALUE &&
      form.branchId !== USER_UNASSIGNED_BRANCH &&
      form.roleIds.length > 0,
    [
      form.address,
      form.branchId,
      form.email,
      form.gender,
      form.phone,
      form.roleIds.length,
      form.username,
    ],
  );

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
          setForm(initialFormState);
        }
        onOpenChange(nextOpen);
      }}
    >
      <SheetContent side="right" className={USER_SHEET_CONTENT_CLASS}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="space-y-1 border-b px-5 py-4">
            <SheetTitle className="text-base">
              {t("users.profile.title")}
            </SheetTitle>
            <SheetDescription>
              {t("users.profile.description")}
            </SheetDescription>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="profile-username">
                  {t("users.profile.fullName")}
                </Label>
                <Input
                  id="profile-username"
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
                <Label htmlFor="profile-email">
                  {t("users.profile.email")}
                </Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-phone">
                  {t("users.profile.phone")}
                </Label>
                <Input
                  id="profile-phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="profile-address">
                  {t("users.profile.address")}
                </Label>
                <Input
                  id="profile-address"
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

            <p className="text-muted-foreground text-xs">
              {t("users.profile.statusReadonlyHint")}
            </p>
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
                  phone: form.phone.trim(),
                  address: form.address.trim(),
                  gender:
                    form.gender === USER_UNKNOWN_GENDER_VALUE
                      ? null
                      : form.gender,
                  roleIds: form.roleIds,
                  branchId:
                    form.branchId === USER_UNASSIGNED_BRANCH
                      ? null
                      : form.branchId,
                })
              }
            >
              {submitting
                ? `${t("users.profile.save")}...`
                : t("users.profile.save")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
