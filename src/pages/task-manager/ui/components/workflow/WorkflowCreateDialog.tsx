import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { WORKFLOW_ISSUE_TYPE_VALUES } from "../../../model/types";
import type { WorkflowCreateForm } from "./types";

type WorkflowCreateDialogProps = {
  open: boolean;
  form: WorkflowCreateForm;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: WorkflowCreateForm) => void;
  onSubmit: () => void;
};

export function WorkflowCreateDialog({
  open,
  form,
  onOpenChange,
  onFormChange,
  onSubmit,
}: WorkflowCreateDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("tasks.workflow.create.title")}</DialogTitle>
          <DialogDescription>
            {t("tasks.workflow.create.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="create-workflow-name">
              {t("tasks.workflow.form.name")}
            </Label>
            <Input
              id="create-workflow-name"
              value={form.name}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  name: event.target.value,
                })
              }
              placeholder={t("tasks.workflow.create.namePlaceholder")}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-workflow-description">
              {t("tasks.workflow.form.description")}
            </Label>
            <Textarea
              id="create-workflow-description"
              value={form.description}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  description: event.target.value,
                })
              }
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("tasks.workflow.form.issueTypes")}</Label>
            <div className="flex flex-wrap gap-1.5">
              {WORKFLOW_ISSUE_TYPE_VALUES.map((issueType) => {
                const active = form.issueTypes.includes(issueType);
                return (
                  <button
                    key={issueType}
                    type="button"
                    onClick={() => {
                      if (active) {
                        if (form.issueTypes.length <= 1) {
                          return;
                        }
                        onFormChange({
                          ...form,
                          issueTypes: form.issueTypes.filter(
                            (value) => value !== issueType,
                          ),
                        });
                        return;
                      }
                      onFormChange({
                        ...form,
                        issueTypes: [...form.issueTypes, issueType],
                      });
                    }}
                    className={cn(
                      "inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition",
                      active
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border bg-muted/20 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    )}
                  >
                    {issueType}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit}>{t("tasks.common.create")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
