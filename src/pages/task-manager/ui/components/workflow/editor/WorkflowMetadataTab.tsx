import { HugeiconsIcon } from "@hugeicons/react";
import { FloppyDiskIcon } from "@hugeicons/core-free-icons";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { TabsContent } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";
import {
  WORKFLOW_ISSUE_TYPE_VALUES,
  type WorkflowIssueType,
} from "../../../../model/types";

type WorkflowMetadataTabProps = {
  workflowId: string;
  name: string;
  description: string;
  issueTypes: WorkflowIssueType[];
  submitting: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onToggleIssueType: (issueType: WorkflowIssueType) => void;
  onSave: (
    workflowId: string,
    payload: {
      name: string;
      description: string;
      issueTypes: WorkflowIssueType[];
    },
  ) => Promise<void>;
};

export function WorkflowMetadataTab({
  workflowId,
  name,
  description,
  issueTypes,
  submitting,
  onNameChange,
  onDescriptionChange,
  onToggleIssueType,
  onSave,
}: WorkflowMetadataTabProps) {
  const appToast = useAppToast();
  const { t } = useI18n();

  return (
    <TabsContent value="metadata" className="space-y-4 pt-2">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="workflow-edit-name">
            {t("tasks.workflow.form.name")}
          </Label>
          <Input
            id="workflow-edit-name"
            value={name}
            disabled={submitting}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="workflow-edit-description">
            {t("tasks.workflow.form.description")}
          </Label>
          <Input
            id="workflow-edit-description"
            value={description}
            disabled={submitting}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{t("tasks.workflow.form.issueTypes")}</Label>
        <div className="flex flex-wrap gap-1.5">
          {WORKFLOW_ISSUE_TYPE_VALUES.map((issueType) => {
            const active = issueTypes.includes(issueType);
            return (
              <button
                key={issueType}
                type="button"
                disabled={submitting}
                onClick={() => onToggleIssueType(issueType)}
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

      <div className="flex justify-end pt-1">
        <Button
          size="sm"
          disabled={submitting}
          onClick={async () => {
            try {
              await onSave(workflowId, { name, description, issueTypes });
              appToast.success({
                title: t("tasks.workflow.toast.updatedTitle"),
                description: t("tasks.workflow.toast.metadataUpdated"),
              });
            } catch (error) {
              appToast.error({
                title: t("tasks.workflow.toast.requestFailedTitle"),
                description: error instanceof Error ? error.message : undefined,
              });
            }
          }}
        >
          <HugeiconsIcon icon={FloppyDiskIcon} className="mr-2 size-4" />
          {t("tasks.workflow.editor.button.saveMetadata")}
        </Button>
      </div>
    </TabsContent>
  );
}
