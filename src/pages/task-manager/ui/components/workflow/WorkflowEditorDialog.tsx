import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleHalfDotIcon,
  ArrowRight01Icon,
  Delete02Icon,
  FloppyDiskIcon,
  LinkSquare02Icon,
  MultiplicationSignIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";
import {
  WORKFLOW_ISSUE_TYPE_VALUES,
  WORKFLOW_STATUS_CATEGORY_VALUES,
  type TaskProject,
  type WorkflowIssueType,
  type WorkflowStatusCategory,
  type WorkflowTemplate,
} from "../../../model/types";
import { EMPTY_STATUS_EDITOR, type StatusEditorState } from "./types";
import { StatusChip } from "./WorkflowUiPrimitives";

type WorkflowEditorDialogProps = {
  open: boolean;
  workflow: WorkflowTemplate;
  projects: TaskProject[];
  workflowIdByProject: Record<string, string>;
  onOpenChange: (open: boolean) => void;
  onSaveMetadata: (
    workflowId: string,
    payload: {
      name: string;
      description: string;
      issueTypes: WorkflowIssueType[];
    },
  ) => void;
  onAssignProjects: (workflowId: string, projectIds: string[]) => void;
  onCreateStatus: (
    workflowId: string,
    payload: {
      code: string;
      name: string;
      color: string;
      category: WorkflowStatusCategory;
    },
  ) => void;
  onUpdateStatus: (
    workflowId: string,
    statusId: string,
    payload: {
      code: string;
      name: string;
      color: string;
      category: WorkflowStatusCategory;
    },
  ) => void;
  onDeleteStatus: (workflowId: string, statusId: string) => void;
  onCreateTransition: (
    workflowId: string,
    fromStatusCode: string,
    toStatusCode: string,
  ) => void;
  onDeleteTransition: (workflowId: string, transitionId: string) => void;
};

export function WorkflowEditorDialog({
  open,
  workflow,
  projects,
  workflowIdByProject,
  onOpenChange,
  onSaveMetadata,
  onAssignProjects,
  onCreateStatus,
  onUpdateStatus,
  onDeleteStatus,
  onCreateTransition,
  onDeleteTransition,
}: WorkflowEditorDialogProps) {
  const appToast = useAppToast();
  const { t } = useI18n();

  const [name, setName] = useState(workflow.name);
  const [description, setDescription] = useState(workflow.description);
  const [issueTypes, setIssueTypes] = useState<WorkflowIssueType[]>(
    workflow.issueTypes,
  );
  const [statusEditor, setStatusEditor] = useState<StatusEditorState | null>(
    null,
  );
  const [fromStatusCode, setFromStatusCode] = useState(
    workflow.statuses[0]?.code || "",
  );
  const [toStatusCode, setToStatusCode] = useState(
    workflow.statuses[1]?.code || workflow.statuses[0]?.code || "",
  );
  const [assignProjectIds, setAssignProjectIds] = useState<string[]>(() =>
    projects
      .filter((project) => workflowIdByProject[project.id] === workflow.id)
      .map((project) => project.id),
  );

  const statusMap = useMemo(
    () => new Map(workflow.statuses.map((status) => [status.code, status])),
    [workflow.statuses],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[zoom:var(--app-scale)] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{workflow.name}</DialogTitle>
          <DialogDescription>
            {t("tasks.workflow.editor.description")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="metadata">
          <TabsList variant="line">
            <TabsTrigger value="metadata">
              {t("tasks.workflow.editor.tab.metadata")}
            </TabsTrigger>
            <TabsTrigger value="status">
              {t("tasks.workflow.editor.tab.status")}
            </TabsTrigger>
            <TabsTrigger value="transitions">
              {t("tasks.workflow.editor.tab.transitions")}
            </TabsTrigger>
            <TabsTrigger value="projects">
              {t("tasks.workflow.editor.tab.projects")}
            </TabsTrigger>
          </TabsList>

          {/* ── Metadata tab ─────────────────────────────────── */}
          <TabsContent value="metadata" className="space-y-4 pt-2">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="workflow-edit-name">
                  {t("tasks.workflow.form.name")}
                </Label>
                <Input
                  id="workflow-edit-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="workflow-edit-description">
                  {t("tasks.workflow.form.description")}
                </Label>
                <Input
                  id="workflow-edit-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
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
                      onClick={() => {
                        if (active) {
                          if (issueTypes.length <= 1) return;
                          setIssueTypes((previous) =>
                            previous.filter((value) => value !== issueType),
                          );
                          return;
                        }
                        setIssueTypes((previous) => [...previous, issueType]);
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

            <div className="flex justify-end pt-1">
              <Button
                size="sm"
                onClick={() => {
                  onSaveMetadata(workflow.id, { name, description, issueTypes });
                  appToast.success({
                    title: t("tasks.workflow.toast.updatedTitle"),
                    description: t("tasks.workflow.toast.metadataUpdated"),
                  });
                }}
              >
                <HugeiconsIcon icon={FloppyDiskIcon} className="mr-2 size-4" />
                {t("tasks.workflow.editor.button.saveMetadata")}
              </Button>
            </div>
          </TabsContent>

          {/* ── Status tab ────────────────────────────────────── */}
          <TabsContent value="status" className="space-y-3 pt-2">
            {/* Status editor (inline, shows when editing/creating) */}
            {statusEditor ? (
              <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    {statusEditor.mode === "create"
                      ? t("tasks.workflow.editor.statusCreate")
                      : t("tasks.workflow.editor.statusEdit")}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setStatusEditor(null)}
                  >
                    <HugeiconsIcon icon={MultiplicationSignIcon} className="size-4" />
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Code</Label>
                    <Input
                      value={statusEditor.code}
                      onChange={(event) =>
                        setStatusEditor((previous) =>
                          previous ? { ...previous, code: event.target.value } : previous,
                        )
                      }
                      placeholder="STATUS_CODE"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      {t("tasks.workflow.editor.statusDisplayName")}
                    </Label>
                    <Input
                      value={statusEditor.name}
                      onChange={(event) =>
                        setStatusEditor((previous) =>
                          previous ? { ...previous, name: event.target.value } : previous,
                        )
                      }
                      placeholder={t("tasks.workflow.editor.statusDisplayName")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Color</Label>
                    <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3">
                      <Input
                        type="color"
                        value={statusEditor.color}
                        onChange={(event) =>
                          setStatusEditor((previous) =>
                            previous ? { ...previous, color: event.target.value } : previous,
                          )
                        }
                        className="h-5 w-5 shrink-0 cursor-pointer border-none bg-transparent p-0 shadow-none"
                      />
                      <span className="text-xs font-mono text-muted-foreground">
                        {statusEditor.color.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Category</Label>
                    <Select
                      value={statusEditor.category}
                      onValueChange={(value) =>
                        setStatusEditor((previous) =>
                          previous
                            ? { ...previous, category: value as WorkflowStatusCategory }
                            : previous,
                        )
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
                  <Button variant="outline" size="sm" onClick={() => setStatusEditor(null)}>
                    {t("tasks.common.none")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!statusEditor.code.trim()) return;
                      if (statusEditor.mode === "create") {
                        onCreateStatus(workflow.id, {
                          code: statusEditor.code,
                          name: statusEditor.name,
                          color: statusEditor.color,
                          category: statusEditor.category,
                        });
                      } else if (statusEditor.statusId) {
                        onUpdateStatus(workflow.id, statusEditor.statusId, {
                          code: statusEditor.code,
                          name: statusEditor.name,
                          color: statusEditor.color,
                          category: statusEditor.category,
                        });
                      }
                      setStatusEditor(null);
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
                onClick={() => setStatusEditor({ ...EMPTY_STATUS_EDITOR })}
              >
                <HugeiconsIcon icon={AddCircleHalfDotIcon} className="mr-2 size-4" />
                {t("tasks.workflow.editor.button.addStatus")}
              </Button>
            )}

            <Separator />

            {/* Status list */}
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
                      className="size-7 hover:bg-primary/10 hover:text-primary"
                      onClick={() =>
                        setStatusEditor({
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
                      className="size-7 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDeleteStatus(workflow.id, status.id)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Transitions tab ───────────────────────────────── */}
          <TabsContent value="transitions" className="space-y-3 pt-2">
            {/* Add transition */}
            <div className="rounded-md border border-dashed bg-muted/20 p-3">
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto]">
                <Select value={fromStatusCode} onValueChange={setFromStatusCode}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("tasks.workflow.editor.fromStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    {workflow.statuses.map((status) => (
                      <SelectItem key={status.code} value={status.code}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="text-muted-foreground grid place-content-center">
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                </div>

                <Select value={toStatusCode} onValueChange={setToStatusCode}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("tasks.workflow.editor.toStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    {workflow.statuses.map((status) => (
                      <SelectItem key={status.code} value={status.code}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    if (!fromStatusCode || !toStatusCode) return;
                    if (fromStatusCode === toStatusCode) {
                      appToast.warning({
                        title: t("tasks.workflow.toast.invalidTransitionTitle"),
                        description: t("tasks.workflow.toast.invalidTransitionDescription"),
                      });
                      return;
                    }
                    onCreateTransition(workflow.id, fromStatusCode, toStatusCode);
                  }}
                >
                  <HugeiconsIcon icon={LinkSquare02Icon} className="mr-2 size-4" />
                  {t("tasks.common.add")}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Transition list */}
            <div className="space-y-1">
              {workflow.transitions.length === 0 ? (
                <div className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
                  {t("tasks.workflow.editor.emptyTransitions")}
                </div>
              ) : (
                workflow.transitions.map((transition) => {
                  const fromStatus = statusMap.get(transition.fromStatusCode);
                  const toStatus = statusMap.get(transition.toStatusCode);
                  return (
                    <div
                      key={transition.id}
                      className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <StatusChip
                          color={fromStatus?.color || "#6B7280"}
                          name={fromStatus?.name || transition.fromStatusCode}
                          code={transition.fromStatusCode}
                        />
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          className="text-muted-foreground size-3.5"
                        />
                        <StatusChip
                          color={toStatus?.color || "#6B7280"}
                          name={toStatus?.name || transition.toStatusCode}
                          code={transition.toStatusCode}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-7 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDeleteTransition(workflow.id, transition.id)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* ── Projects tab ──────────────────────────────────── */}
          <TabsContent value="projects" className="space-y-3 pt-2">
            <div className="grid gap-2 md:grid-cols-2">
              {projects.map((project) => {
                const active = assignProjectIds.includes(project.id);
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() =>
                      setAssignProjectIds((previous) =>
                        active
                          ? previous.filter((id) => id !== project.id)
                          : [...previous, project.id],
                      )
                    }
                    className={cn(
                      "flex items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                      active
                        ? "border-primary/40 bg-primary/5"
                        : "border-border bg-card hover:bg-muted/30",
                    )}
                  >
                    <Checkbox checked={active} className="pointer-events-none shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium leading-tight truncate">{project.name}</p>
                      <p className="text-muted-foreground text-xs font-mono">{project.key}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-1">
              <Button
                size="sm"
                onClick={() => {
                  onAssignProjects(workflow.id, assignProjectIds);
                  appToast.success({
                    title: t("tasks.workflow.toast.updatedTitle"),
                    description: t("tasks.workflow.toast.appliedProjects"),
                  });
                }}
              >
                <HugeiconsIcon icon={FloppyDiskIcon} className="mr-2 size-4" />
                {t("tasks.workflow.editor.button.apply")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
