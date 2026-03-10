import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleHalfDotIcon,
  Delete02Icon,
  MultiplicationSignIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import { Badge } from "@/shared/ui/badge";
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
import { Separator } from "@/shared/ui/separator";
import { TabsContent } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";
import {
  WORKFLOW_STATUS_CATEGORY_VALUES,
  type WorkflowStatusCategory,
} from "../../../../model/types";
import type { WorkflowDetail } from "../../../../model/workflowManagement.types";
import {
  EMPTY_STATUS_EDITOR,
  type StatusEditorState,
} from "../types";
import { StatusChip } from "../WorkflowUiPrimitives";

type WorkflowStatusTabProps = {
  workflow: WorkflowDetail;
  submitting: boolean;
  statusEditor: StatusEditorState | null;
  onStatusEditorChange: (value: StatusEditorState | null) => void;
  onCreateStatus: (
    workflowId: string,
    payload: {
      code: string;
      name: string;
      color: string;
      category: WorkflowStatusCategory;
    },
  ) => Promise<void>;
  onUpdateStatus: (
    workflowId: string,
    statusId: string,
    payload: {
      code: string;
      name: string;
      color: string;
      category: WorkflowStatusCategory;
    },
  ) => Promise<void>;
  onDeleteStatus: (workflowId: string, statusId: string) => Promise<void>;
};

export function WorkflowStatusTab({
  workflow,
  submitting,
  statusEditor,
  onStatusEditorChange,
  onCreateStatus,
  onUpdateStatus,
  onDeleteStatus,
}: WorkflowStatusTabProps) {
  const appToast = useAppToast();
  const { t } = useI18n();

  return (
    <TabsContent value="status" className="space-y-3 pt-2">
      {statusEditor ? (
        <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              {statusEditor.mode === "create"
                ? t("tasks.workflow.editor.statusCreate")
                : t("tasks.workflow.editor.statusEdit")}
            </p>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={submitting}
              onClick={() => onStatusEditorChange(null)}
            >
              <HugeiconsIcon
                icon={MultiplicationSignIcon}
                className="size-4"
              />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Code
              </Label>
              <Input
                value={statusEditor.code}
                disabled={submitting}
                onChange={(event) =>
                  onStatusEditorChange({
                    ...statusEditor,
                    code: event.target.value,
                  })
                }
                placeholder="STATUS_CODE"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                {t("tasks.workflow.editor.statusDisplayName")}
              </Label>
              <Input
                value={statusEditor.name}
                disabled={submitting}
                onChange={(event) =>
                  onStatusEditorChange({
                    ...statusEditor,
                    name: event.target.value,
                  })
                }
                placeholder={t("tasks.workflow.editor.statusDisplayName")}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Color
              </Label>
              <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3">
                <Input
                  type="color"
                  value={statusEditor.color}
                  disabled={submitting}
                  onChange={(event) =>
                    onStatusEditorChange({
                      ...statusEditor,
                      color: event.target.value,
                    })
                  }
                  className="h-5 w-5 shrink-0 cursor-pointer border-none bg-transparent p-0 shadow-none"
                />
                <span className="font-mono text-xs text-muted-foreground">
                  {statusEditor.color.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Category
              </Label>
              <Select
                value={statusEditor.category}
                disabled={submitting}
                onValueChange={(value) =>
                  onStatusEditorChange({
                    ...statusEditor,
                    category: value as WorkflowStatusCategory,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKFLOW_STATUS_CATEGORY_VALUES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => onStatusEditorChange(null)}
            >
              {t("tasks.common.close")}
            </Button>
            <Button
              size="sm"
              disabled={submitting}
              onClick={async () => {
                if (!statusEditor.code.trim()) return;
                try {
                  if (statusEditor.mode === "create") {
                    await onCreateStatus(workflow.id, {
                      code: statusEditor.code,
                      name: statusEditor.name,
                      color: statusEditor.color,
                      category: statusEditor.category,
                    });
                  } else if (statusEditor.statusId) {
                    await onUpdateStatus(workflow.id, statusEditor.statusId, {
                      code: statusEditor.code,
                      name: statusEditor.name,
                      color: statusEditor.color,
                      category: statusEditor.category,
                    });
                  }
                  onStatusEditorChange(null);
                } catch (error) {
                  appToast.error({
                    title: t("tasks.workflow.toast.requestFailedTitle"),
                    description:
                      error instanceof Error ? error.message : undefined,
                  });
                }
              }}
            >
              {t("tasks.common.save")}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          disabled={submitting}
          onClick={() => onStatusEditorChange({ ...EMPTY_STATUS_EDITOR })}
        >
          <HugeiconsIcon icon={AddCircleHalfDotIcon} className="mr-2 size-4" />
          {t("tasks.workflow.editor.button.addStatus")}
        </Button>
      )}

      <Separator />

      <div className="space-y-1">
        {workflow.statuses.map((status) => (
          <div
            key={status.id}
            className={cn(
              "flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors",
              statusEditor?.statusId === status.id
                ? "border-primary/30 bg-muted"
                : "border-border bg-card hover:bg-muted/30",
            )}
          >
            <div className="flex items-center gap-3">
              <StatusChip
                color={status.color}
                name={status.name}
                code={status.code}
              />
              <Badge variant="outline" className="h-5 rounded-full text-[10px]">
                {status.category}
              </Badge>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={submitting}
                className="size-7 hover:bg-primary/10 hover:text-primary"
                onClick={() =>
                  onStatusEditorChange({
                    mode: "edit",
                    statusId: status.id,
                    code: status.code,
                    name: status.name,
                    color: status.color,
                    category: status.category,
                  })
                }
              >
                <HugeiconsIcon icon={PencilEdit02Icon} className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={submitting}
                className="size-7 hover:bg-destructive/10 hover:text-destructive"
                onClick={async () => {
                  try {
                    await onDeleteStatus(workflow.id, status.id);
                  } catch (error) {
                    appToast.error({
                      title: t("tasks.workflow.toast.requestFailedTitle"),
                      description:
                        error instanceof Error ? error.message : undefined,
                    });
                  }
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </TabsContent>
  );
}
