import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleHalfDotIcon,
  Delete02Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
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
import { Separator } from "@/shared/ui/separator";
import { cn } from "@/shared/lib/utils";
import {
  type TaskPriorityItem,
  type CreateTaskPriorityPayload,
  type UpdateTaskPriorityPayload,
} from "../../../model/types";

type TaskPriorityManagerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priorities: TaskPriorityItem[];
  onCreatePriority: (payload: CreateTaskPriorityPayload) => void;
  onUpdatePriority: (id: string, payload: UpdateTaskPriorityPayload) => void;
  onDeletePriority: (id: string) => void;
};

type PriorityEditorState = {
  mode: "create" | "edit";
  id?: string;
  code: string;
  name: string;
  color: string;
  order: number;
};

const EMPTY_EDITOR: PriorityEditorState = {
  mode: "create",
  code: "",
  name: "",
  color: "#6B7280",
  order: 0,
};

export function TaskPriorityManagerDialog({
  open,
  onOpenChange,
  priorities,
  onCreatePriority,
  onUpdatePriority,
  onDeletePriority,
}: TaskPriorityManagerDialogProps) {
  const { t } = useI18n();
  const [editor, setEditor] = useState<PriorityEditorState | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setEditor(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    if (!editor || !editor.code.trim() || !editor.name.trim()) return;

    const payload: CreateTaskPriorityPayload = {
      code: editor.code.trim().toUpperCase(),
      name: editor.name.trim(),
      color: editor.color,
      order: editor.order,
    };

    if (editor.mode === "create") {
      onCreatePriority(payload);
    } else if (editor.id) {
      onUpdatePriority(editor.id, payload);
    }

    setEditor(null);
  };

  const codeError = editor && !editor.code.trim() ? "Code is required" : "";
  const nameError = editor && !editor.name.trim() ? "Name is required" : "";
  const canSave = editor && !codeError && !nameError;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="[zoom:var(--app-scale)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("tasks.projectDetails.priorityManager")}</DialogTitle>
          <DialogDescription>
            Manage global task priorities for your projects.
          </DialogDescription>
        </DialogHeader>

        {/* Priority list */}
        <div className="space-y-1">
          {priorities.map((priority) => (
            <div
              key={priority.id}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                editor?.id === priority.id
                  ? "border-primary/30 bg-muted"
                  : "border-border bg-card",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-4 text-center font-mono text-xs">
                  {priority.order}
                </span>
                <div
                  className="ring-border size-3.5 shrink-0 rounded-full ring-1"
                  style={{ backgroundColor: priority.color }}
                />
                <div>
                  <p className="text-sm leading-tight font-medium">
                    {priority.name}
                  </p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {priority.code}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setEditor({
                      mode: "edit",
                      id: priority.id,
                      code: priority.code,
                      name: priority.name,
                      color: priority.color,
                      order: priority.order,
                    })
                  }
                >
                  <HugeiconsIcon icon={PencilEdit02Icon} className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDeletePriority(priority.id)}
                  disabled={priorities.length <= 1}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />
        {/* Editor form */}
        {editor ? (
          <div className="border-border bg-card space-y-3 rounded-md border p-3">
            <p className="text-sm font-semibold">
              {editor.mode === "create"
                ? t("tasks.projectDetails.priorityCreate")
                : t("tasks.projectDetails.priorityEdit")}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="priority-code">
                  {t("tasks.projectDetails.priorityCode")}
                </Label>
                <Input
                  id="priority-code"
                  value={editor.code}
                  onChange={(e) =>
                    setEditor({ ...editor, code: e.target.value })
                  }
                  placeholder="HIGH"
                />
                {codeError && (
                  <p className="text-destructive text-xs">{codeError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority-name">
                  {t("tasks.projectDetails.priorityName")}
                </Label>
                <Input
                  id="priority-name"
                  value={editor.name}
                  onChange={(e) =>
                    setEditor({ ...editor, name: e.target.value })
                  }
                  placeholder="High"
                />
                {nameError && (
                  <p className="text-destructive text-xs">{nameError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority-color">
                  {t("tasks.projectDetails.priorityColor")}
                </Label>
                {/* Wrapper styled like Input to keep consistent border/bg */}
                <div className="border-input bg-background flex h-9 w-full items-center gap-2 rounded-md border px-3 py-1 shadow-sm">
                  <Input
                    id="priority-color"
                    type="color"
                    value={editor.color}
                    onChange={(e) =>
                      setEditor({ ...editor, color: e.target.value })
                    }
                    className="h-5 w-5 shrink-0 cursor-pointer border-none bg-transparent p-0 shadow-none outline-none"
                  />
                  <span className="text-muted-foreground font-mono text-xs">
                    {editor.color.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority-order">
                  {t("tasks.projectDetails.priorityOrder")}
                </Label>
                <Input
                  id="priority-order"
                  type="number"
                  value={editor.order}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditor(null)}
              >
                {t("tasks.common.none")}
              </Button>
              <Button size="sm" disabled={!canSave} onClick={handleSave}>
                {t("tasks.common.save")}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              setEditor({ ...EMPTY_EDITOR, order: priorities.length + 1 })
            }
          >
            <HugeiconsIcon
              icon={AddCircleHalfDotIcon}
              className="mr-2 size-4"
            />
            {t("tasks.projectDetails.priorityCreate")}
          </Button>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("tasks.common.none")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
