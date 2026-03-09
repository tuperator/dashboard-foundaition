import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import {
  BRANCH_CREATE_STATUS_VALUES,
  BRANCH_DEFAULT_STATUS,
  BRANCH_FORM_DIALOG_CLASS,
} from "../../model/constants";
import type {
  BranchItem,
  BranchStatus,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "../../model/types";

type BranchFormDialogProps = {
  mode: "create" | "edit";
  open: boolean;
  branch: BranchItem | null;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: CreateBranchPayload) => void;
  onUpdate: (branchId: string, payload: UpdateBranchPayload) => void;
};

type BranchFormState = {
  name: string;
  address: string;
  status: BranchStatus;
  agentId: string;
};

const CREATE_INITIAL_FORM: BranchFormState = {
  name: "",
  address: "",
  status: BRANCH_DEFAULT_STATUS,
  agentId: "",
};

export function BranchFormDialog({
  mode,
  open,
  branch,
  submitting = false,
  onOpenChange,
  onCreate,
  onUpdate,
}: BranchFormDialogProps) {
  const { t } = useI18n();

  const initialState = useMemo<BranchFormState>(() => {
    if (mode === "edit" && branch) {
      return {
        name: branch.name,
        address: branch.address || "",
        status: branch.status,
        agentId: branch.agentId || "",
      };
    }
    return CREATE_INITIAL_FORM;
  }, [branch, mode]);

  const [form, setForm] = useState<BranchFormState>(initialState);

  const title =
    mode === "create"
      ? t("branch.form.create.title")
      : t("branch.form.edit.title");

  const submitLabel =
    mode === "create"
      ? t("branch.form.submitCreate")
      : t("branch.form.submitUpdate");

  const nameError =
    form.name.trim().length === 0 ? t("branch.form.nameRequired") : "";
  const canSubmit = !nameError;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setForm(initialState);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className={BRANCH_FORM_DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("branch.form.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="branch-name">{t("branch.form.name")}</Label>
            <Input
              id="branch-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
            {nameError ? (
              <p className="text-destructive text-xs">{nameError}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="branch-address">{t("branch.form.address")}</Label>
            <Input
              id="branch-address"
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, address: event.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="branch-agent-id">{t("branch.form.agentId")}</Label>
            <Input
              id="branch-agent-id"
              value={form.agentId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, agentId: event.target.value }))
              }
            />
          </div>

          {mode === "create" ? (
            <div className="space-y-1.5">
              <Label>{t("branch.form.status")}</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    status: value as BranchStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANCH_CREATE_STATUS_VALUES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "ACTIVE"
                        ? t("branch.badge.active")
                        : status === "INACTIVE"
                          ? t("branch.badge.inactive")
                          : t("branch.badge.deleted")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              {t("branch.form.statusHint")}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("branch.common.cancel")}
          </Button>
          <Button
            disabled={!canSubmit || submitting}
            onClick={() => {
              if (mode === "create") {
                onCreate({
                  name: form.name.trim(),
                  address: form.address.trim() || null,
                  agentId: form.agentId.trim() || null,
                  status: form.status,
                });
                return;
              }

              if (branch) {
                onUpdate(branch.id, {
                  name: form.name.trim(),
                  address: form.address.trim() || null,
                  agentId: form.agentId.trim() || null,
                });
              }
            }}
          >
            {submitting ? `${submitLabel}...` : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
