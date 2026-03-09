import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleHalfDotIcon,
  ArrowRight01Icon,
  FloppyDiskIcon,
  LinkSquare02Icon,
  MultiplicationSignIcon,
} from "@hugeicons/core-free-icons";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
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
    payload: { name: string; description: string; issueTypes: WorkflowIssueType[] },
  ) => void;
  onAssignProjects: (workflowId: string, projectIds: string[]) => void;
  onCreateStatus: (
    workflowId: string,
    payload: { code: string; name: string; color: string; category: WorkflowStatusCategory },
  ) => void;
  onUpdateStatus: (
    workflowId: string,
    statusId: string,
    payload: { code: string; name: string; color: string; category: WorkflowStatusCategory },
  ) => void;
  onDeleteStatus: (workflowId: string, statusId: string) => void;
  onCreateTransition: (workflowId: string, fromStatusCode: string, toStatusCode: string) => void;
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
  const [issueTypes, setIssueTypes] = useState<WorkflowIssueType[]>(workflow.issueTypes);
  const [statusEditor, setStatusEditor] = useState<StatusEditorState | null>(null);
  const [fromStatusCode, setFromStatusCode] = useState(workflow.statuses[0]?.code || "");
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
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{workflow.name}</DialogTitle>
          <DialogDescription>
            {t("tasks.workflow.editor.description")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="metadata">
          <TabsList variant="line">
            <TabsTrigger value="metadata">{t("tasks.workflow.editor.tab.metadata")}</TabsTrigger>
            <TabsTrigger value="status">{t("tasks.workflow.editor.tab.status")}</TabsTrigger>
            <TabsTrigger value="transitions">{t("tasks.workflow.editor.tab.transitions")}</TabsTrigger>
            <TabsTrigger value="projects">{t("tasks.workflow.editor.tab.projects")}</TabsTrigger>
          </TabsList>

          <TabsContent value="metadata" className="space-y-3">
            <div className="rounded-xl border bg-muted/10 p-3">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="workflow-edit-name">{t("tasks.workflow.form.name")}</Label>
                  <Input
                    id="workflow-edit-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
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

              <div className="mt-3 space-y-1">
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
                            if (issueTypes.length <= 1) {
                              return;
                            }
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

              <div className="mt-3">
                <Button
                  size="sm"
                  onClick={() => {
                    onSaveMetadata(workflow.id, {
                      name,
                      description,
                      issueTypes,
                    });
                    appToast.success({
                      title: t("tasks.workflow.toast.updatedTitle"),
                      description: t("tasks.workflow.toast.metadataUpdated"),
                    });
                  }}
                >
                  <HugeiconsIcon icon={FloppyDiskIcon} />
                  {t("tasks.workflow.editor.button.saveMetadata")}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-3">
            <section className="rounded-xl border bg-muted/10 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {t("tasks.workflow.editor.statusCatalog")}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStatusEditor({ ...EMPTY_STATUS_EDITOR })}
                >
                  <HugeiconsIcon icon={AddCircleHalfDotIcon} />
                  {t("tasks.workflow.editor.button.addStatus")}
                </Button>
              </div>

              {statusEditor ? (
                <div className="mb-3 rounded-lg border border-primary/30 bg-primary/[0.03] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {statusEditor.mode === "create"
                        ? t("tasks.workflow.editor.statusCreate")
                        : t("tasks.workflow.editor.statusEdit")}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setStatusEditor(null)}
                    >
                      <HugeiconsIcon icon={MultiplicationSignIcon} />
                    </Button>
                  </div>

                  <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto_180px]">
                    <Input
                      value={statusEditor.code}
                      onChange={(event) =>
                        setStatusEditor((previous) =>
                          previous
                            ? {
                                ...previous,
                                code: event.target.value,
                              }
                            : previous,
                        )
                      }
                      placeholder="STATUS_CODE"
                    />
                    <Input
                      value={statusEditor.name}
                      onChange={(event) =>
                        setStatusEditor((previous) =>
                          previous
                            ? {
                                ...previous,
                                name: event.target.value,
                              }
                            : previous,
                        )
                      }
                      placeholder={t("tasks.workflow.editor.statusDisplayName")}
                    />
                    <Input
                      type="color"
                      value={statusEditor.color}
                      onChange={(event) =>
                        setStatusEditor((previous) =>
                          previous
                            ? {
                                ...previous,
                                color: event.target.value,
                              }
                            : previous,
                        )
                      }
                      className="h-7 w-14 p-1"
                    />
                    <Select
                      value={statusEditor.category}
                      onValueChange={(value) =>
                        setStatusEditor((previous) =>
                          previous
                            ? {
                                ...previous,
                                category: value as WorkflowStatusCategory,
                              }
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

                  <div className="mt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!statusEditor.code.trim()) {
                          return;
                        }

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
              ) : null}

              <div className="space-y-1.5">
                {workflow.statuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center justify-between rounded-lg border bg-card px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <StatusChip
                        color={status.color}
                        name={status.name}
                        code={status.code}
                      />
                      <Badge variant="outline" className="h-6 rounded-full">
                        {status.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
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
                        {t("tasks.common.edit")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteStatus(workflow.id, status.id)}
                      >
                        {t("tasks.common.delete")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="transitions" className="space-y-3">
            <section className="rounded-xl border bg-muted/10 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {t("tasks.workflow.editor.transitionRules")}
                </p>
                <Badge variant="outline" className="h-6 rounded-full">
                  {workflow.transitions.length}
                </Badge>
              </div>

              <div className="mb-3 rounded-lg border border-dashed bg-card p-2.5">
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

                  <div className="grid place-content-center text-muted-foreground">
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
                      if (!fromStatusCode || !toStatusCode) {
                        return;
                      }
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
                    <HugeiconsIcon icon={LinkSquare02Icon} />
                    {t("tasks.common.add")}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                {workflow.transitions.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {t("tasks.workflow.editor.emptyTransitions")}
                  </div>
                ) : (
                  workflow.transitions.map((transition) => {
                    const fromStatus = statusMap.get(transition.fromStatusCode);
                    const toStatus = statusMap.get(transition.toStatusCode);

                    return (
                      <article
                        key={transition.id}
                        className="flex items-center justify-between rounded-lg border bg-card px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <StatusChip
                            color={fromStatus?.color || "#6B7280"}
                            name={fromStatus?.name || transition.fromStatusCode}
                            code={transition.fromStatusCode}
                          />
                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            className="size-3.5 text-muted-foreground"
                          />
                          <StatusChip
                            color={toStatus?.color || "#6B7280"}
                            name={toStatus?.name || transition.toStatusCode}
                            code={transition.toStatusCode}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => onDeleteTransition(workflow.id, transition.id)}
                        >
                          {t("tasks.common.remove")}
                        </Button>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="projects" className="space-y-3">
            <section className="rounded-xl border bg-muted/10 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {t("tasks.workflow.editor.applyProjects")}
                </p>
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
                  <HugeiconsIcon icon={FloppyDiskIcon} />
                  {t("tasks.workflow.editor.button.apply")}
                </Button>
              </div>

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
                        "flex items-center justify-between rounded-lg border px-2.5 py-2 text-left transition",
                        active
                          ? "border-primary/60 bg-primary/10"
                          : "border-border bg-card hover:border-primary/30",
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.key}</p>
                      </div>
                      <input
                        type="checkbox"
                        readOnly
                        checked={active}
                        className="pointer-events-none size-4 rounded border-border"
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
