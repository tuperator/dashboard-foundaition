import { useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Spinner } from "@/shared/ui/spinner";
import { Textarea } from "@/shared/ui/textarea";
import {
  createTask as createTaskApi,
  updateTask as updateTaskApi,
} from "../../model/projectManagement.api";
import {
  getWorkflowStatusMeta,
  getWorkflowStatusStyle,
} from "../../model/helpers/workflowStatusHelpers";
import {
  type TaskItem,
  type TaskManagerUserOption,
  type TaskPriorityItem,
  type TaskProject,
} from "../../model/types";
import { TaskUserSingleSelect } from "./user-select/TaskUserSelect";

type TaskDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  task: TaskItem | null;
  projects: TaskProject[];
  defaultProjectId: string | null;
  lockProjectId?: string;
  assigneeOptions: TaskManagerUserOption[];
  statusOptions: string[];
  workflowStatusByCode: Map<string, { name: string; color: string }>;
  taskPriorities: TaskPriorityItem[];
  onOpenChange: (open: boolean) => void;
};

type FormState = {
  title: string;
  description: string;
  projectId: string;
  assignee: string;
  status: string;
  priority: string;
};

const UNASSIGNED_VALUE = "__UNASSIGNED__";

const EMPTY_STATE: FormState = {
  title: "",
  description: "",
  projectId: "",
  assignee: UNASSIGNED_VALUE,
  status: "",
  priority: "",
};

export function TaskDialog({
  open,
  mode,
  task,
  projects,
  defaultProjectId,
  lockProjectId,
  assigneeOptions,
  statusOptions,
  workflowStatusByCode,
  taskPriorities,
  onOpenChange,
}: TaskDialogProps) {
  const { t, tp } = useI18n();
  const appToast = useAppToast();
  const queryClient = useQueryClient();
  const initialFormState = useMemo(
    () =>
      getInitialFormState(
        task,
        defaultProjectId,
        lockProjectId,
        projects,
        statusOptions,
        taskPriorities,
      ),
    [
      defaultProjectId,
      lockProjectId,
      projects,
      statusOptions,
      task,
      taskPriorities,
    ],
  );
  const taskDialogSchema = useMemo(
    () => createTaskDialogSchema(projects, statusOptions, taskPriorities),
    [projects, statusOptions, taskPriorities],
  );
  const {
    control,
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    reset,
  } = useForm<FormState>({
    resolver: zodResolver(taskDialogSchema),
    mode: "onChange",
    defaultValues: initialFormState,
  });
  const projectId = useWatch({
    control,
    name: "projectId",
  });
  const assignee = useWatch({
    control,
    name: "assignee",
  });
  const priorityCode = useWatch({
    control,
    name: "priority",
  });
  const statusCode = useWatch({
    control,
    name: "status",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(initialFormState);
  }, [initialFormState, open, reset]);

  const selectedProject = useMemo(
    () =>
      projects.find((project) => project.id === (lockProjectId || projectId)) ||
      null,
    [lockProjectId, projectId, projects],
  );
  const selectedPriority = useMemo(
    () =>
      taskPriorities.find((priority) => priority.code === priorityCode) || null,
    [priorityCode, taskPriorities],
  );
  const selectedStatus = useMemo(
    () => getWorkflowStatusMeta(workflowStatusByCode, statusCode || ""),
    [statusCode, workflowStatusByCode],
  );
  const isUnassigned = !assignee || assignee === UNASSIGNED_VALUE;
  const createTaskMutation = useMutation({
    mutationFn: createTaskApi,
  });
  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: Parameters<typeof updateTaskApi>[1];
    }) => updateTaskApi(taskId, payload),
  });
  const handleSelectOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      requestAnimationFrame(() => {
        activeElement.blur();
      });
    }
  };

  const submitForm = handleSubmit(async (values) => {
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      projectId: lockProjectId || values.projectId,
      assignee:
        !values.assignee || values.assignee === UNASSIGNED_VALUE
          ? null
          : values.assignee,
      status: values.status,
      priority: values.priority,
    };

    try {
      if (mode === "create") {
        await createTaskMutation.mutateAsync(payload);
        appToast.success({
          title: t("tasks.projectDetails.toast.issueCreatedTitle"),
          description: tp("tasks.projectDetails.toast.issueCreatedDescription", {
            name: payload.title,
          }),
        });
      } else {
        if (!task) {
          throw new Error("Task not found");
        }

        await updateTaskMutation.mutateAsync({
          taskId: task.id,
          payload,
        });
        appToast.success({
          title: t("tasks.projectDetails.toast.issueUpdatedTitle"),
          description: tp("tasks.projectDetails.toast.issueUpdatedDescription", {
            name: payload.title,
          }),
        });
      }

      await queryClient.invalidateQueries({
        queryKey: ["task-project-tasks"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["task-project-kanban-tasks"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["task-project-backlog-tasks"],
      });
      onOpenChange(false);
    } catch (error: unknown) {
      appToast.warning({
        title: t("tasks.projectDetails.toast.taskRequestFailedTitle"),
        description:
          error instanceof Error
            ? error.message
            : t("tasks.projectDetails.toast.taskRequestFailedDescription"),
      });
      throw error;
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSubmitting) {
          return;
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="bg-card gap-0 overflow-hidden p-0 [zoom:var(--app-scale)] sm:max-w-2xl">
        <div>
          <DialogHeader className="border-b px-6 pt-6 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle>
                {mode === "create" ? "Create task" : "Update task"}
              </DialogTitle>
              {selectedProject ? (
                <span className="bg-muted text-muted-foreground inline-flex h-6 max-w-full items-center rounded-full border px-2.5 text-[11px] font-medium">
                  <span className="truncate">
                    {selectedProject.key || selectedProject.name}
                  </span>
                </span>
              ) : null}
            </div>
            <DialogDescription>
              Capture issue details, assignee, status and priority.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitForm}>
            <div className="grid gap-5 border-y px-6 py-5">
              <div className="grid gap-2">
                <Label htmlFor="task-title" required>
                  Task title
                </Label>
                <Controller
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="task-title"
                      value={field.value || ""}
                      aria-invalid={!!errors.title}
                      disabled={isSubmitting}
                      placeholder="Thiết kế màn quản lý user"
                      className="h-10 rounded-lg px-3 text-sm"
                    />
                  )}
                />
                {errors.title?.message ? (
                  <p className="text-destructive text-xs">
                    {errors.title.message}
                  </p>
                ) : null}
              </div>

              {!lockProjectId ? (
                <div className="grid gap-2">
                  <Label htmlFor="task-project" required>
                    Project
                  </Label>
                  <Controller
                    control={control}
                    name="projectId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        onOpenChange={handleSelectOpenChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          id="task-project"
                          aria-invalid={!!errors.projectId}
                          className="h-10 w-full rounded-lg px-3 text-sm"
                        >
                          <SelectValue placeholder="Choose project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.key} - {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.projectId?.message ? (
                    <p className="text-destructive text-xs">
                      {errors.projectId.message}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="task-assignee">Assignee</Label>
                  <Controller
                    control={control}
                    name="assignee"
                    render={({ field }) => (
                      <Button
                        type="button"
                        variant={isUnassigned ? "secondary" : "ghost"}
                        size="sm"
                        disabled={isSubmitting}
                        className={cn(
                          "h-7 rounded-full px-2.5 text-xs",
                          !isUnassigned && "text-muted-foreground",
                        )}
                        onClick={() => field.onChange(UNASSIGNED_VALUE)}
                      >
                        Unassigned
                      </Button>
                    )}
                  />
                </div>
                <Controller
                  control={control}
                  name="assignee"
                  render={({ field }) => (
                    <TaskUserSingleSelect
                      users={assigneeOptions}
                      value={
                        field.value === UNASSIGNED_VALUE ? "" : field.value
                      }
                      onChange={field.onChange}
                      placeholder="Select assignee"
                      searchPlaceholder="Search assignee"
                      emptyLabel="No users found"
                      disabled={isSubmitting}
                      triggerClassName="min-h-11 rounded-lg px-3 py-2"
                    />
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="task-status" required>
                    Status
                  </Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        onOpenChange={handleSelectOpenChange}
                        disabled={isSubmitting || statusOptions.length === 0}
                      >
                        <SelectTrigger
                          id="task-status"
                          aria-invalid={!!errors.status}
                          className="h-11 w-full rounded-lg px-3 text-sm"
                          style={getWorkflowStatusStyle(
                            workflowStatusByCode,
                            field.value,
                          )}
                        >
                          <SelectValue
                            placeholder={
                              statusOptions.length === 0
                                ? "No statuses available"
                                : "Status"
                            }
                          >
                            {field.value ? (
                              <span className="flex min-w-0 items-center gap-2 text-sm font-normal">
                                <span
                                  className="size-2.5 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor: selectedStatus.color,
                                  }}
                                />
                                <span className="truncate">
                                  {selectedStatus.name}
                                </span>
                              </span>
                            ) : null}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              <span className="flex items-center gap-2">
                                <span
                                  className="size-2 rounded-full"
                                  style={{
                                    backgroundColor: getWorkflowStatusMeta(
                                      workflowStatusByCode,
                                      status,
                                    ).color,
                                  }}
                                />
                                {
                                  getWorkflowStatusMeta(
                                    workflowStatusByCode,
                                    status,
                                  ).name
                                }
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status?.message ? (
                    <p className="text-destructive text-xs">
                      {errors.status.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Controller
                    control={control}
                    name="priority"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        onOpenChange={handleSelectOpenChange}
                        disabled={isSubmitting || taskPriorities.length === 0}
                      >
                        <SelectTrigger
                          id="task-priority"
                          aria-invalid={!!errors.priority}
                          className="h-11 w-full rounded-lg px-3 text-sm"
                        >
                          <SelectValue
                            placeholder={
                              taskPriorities.length === 0
                                ? "No priorities available"
                                : "Priority"
                            }
                          >
                            {selectedPriority ? (
                              <span className="flex min-w-0 items-center gap-2 text-sm font-normal">
                                <span
                                  className="size-2.5 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor: selectedPriority.color,
                                  }}
                                />
                                <span className="truncate">
                                  {selectedPriority.name}
                                </span>
                              </span>
                            ) : null}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {taskPriorities.map((priority) => (
                            <SelectItem
                              key={priority.code}
                              value={priority.code}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className="size-2 rounded-full"
                                  style={{ backgroundColor: priority.color }}
                                />
                                {priority.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.priority?.message ? (
                    <p className="text-destructive text-xs">
                      {errors.priority.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-description">Description</Label>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="task-description"
                      value={field.value || ""}
                      aria-invalid={!!errors.description}
                      disabled={isSubmitting}
                      placeholder="Task detail..."
                      className="min-h-32 rounded-xl px-3 py-2 text-sm"
                    />
                  )}
                />
                {errors.description?.message ? (
                  <p className="text-destructive text-xs">
                    {errors.description.message}
                  </p>
                ) : null}
              </div>
            </div>

            <DialogFooter className="px-6 py-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="size-4" />
                    {mode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : mode === "create" ? (
                  "Create task"
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function createTaskDialogSchema(
  projects: TaskProject[],
  statusOptions: string[],
  taskPriorities: TaskPriorityItem[],
) {
  const projectIds = new Set(projects.map((project) => project.id));
  const priorityCodes = new Set(
    taskPriorities.map((priority) => priority.code),
  );

  return z.object({
    title: z
      .string()
      .trim()
      .min(1, "Task title is required")
      .max(255, "Task title must be 255 characters or fewer"),
    description: z
      .string()
      .trim()
      .max(4000, "Description must be 4000 characters or fewer"),
    projectId: z
      .string()
      .trim()
      .min(1, "Project is required")
      .refine((value) => projectIds.has(value), "Selected project is invalid"),
    assignee: z.string(),
    status: z
      .string()
      .trim()
      .min(1, "Status is required")
      .refine(
        (value) => statusOptions.includes(value),
        "Selected status is invalid",
      ),
    priority: z
      .string()
      .trim()
      .min(1, "Priority is required")
      .refine(
        (value) => priorityCodes.has(value),
        "Selected priority is invalid",
      ),
  });
}

function getInitialFormState(
  task: TaskItem | null,
  defaultProjectId: string | null,
  lockProjectId: string | undefined,
  projects: TaskProject[],
  statusOptions: string[],
  taskPriorities: TaskPriorityItem[],
): FormState {
  const projectId = getValidProjectId(
    task?.projectId,
    lockProjectId,
    defaultProjectId,
    projects,
  );

  if (task) {
    return {
      title: task.title,
      description: task.description,
      projectId,
      assignee: task.assignee || UNASSIGNED_VALUE,
      status: getValidStatus(task.status, statusOptions),
      priority: getValidPriority(task.priority, taskPriorities),
    };
  }

  return {
    ...EMPTY_STATE,
    projectId,
    status: getValidStatus(EMPTY_STATE.status, statusOptions),
    priority: getValidPriority(EMPTY_STATE.priority, taskPriorities),
  };
}

function getValidProjectId(
  projectId: string | null | undefined,
  lockProjectId: string | undefined,
  defaultProjectId: string | null,
  projects: TaskProject[],
) {
  if (lockProjectId) {
    return lockProjectId;
  }

  if (projectId && projects.some((project) => project.id === projectId)) {
    return projectId;
  }

  if (
    defaultProjectId &&
    projects.some((project) => project.id === defaultProjectId)
  ) {
    return defaultProjectId;
  }

  return projects[0]?.id || "";
}

function getValidStatus(
  status: string | null | undefined,
  statusOptions: string[],
) {
  if (status && statusOptions.includes(status)) {
    return status;
  }

  return statusOptions[0] || "";
}

function getValidPriority(
  priority: string | null | undefined,
  taskPriorities: TaskPriorityItem[],
) {
  if (
    priority &&
    taskPriorities.some((priorityItem) => priorityItem.code === priority)
  ) {
    return priority;
  }

  return (
    taskPriorities.find((priorityItem) => priorityItem.code === "MEDIUM")
      ?.code ||
    taskPriorities[0]?.code ||
    ""
  );
}
