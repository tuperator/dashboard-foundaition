import { useMemo, useState } from "react";
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
import { Textarea } from "@/shared/ui/textarea";
import {
  type TaskItem,
  type TaskManagerUserOption,
  type TaskPriority,
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
  taskPriorities: TaskPriorityItem[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    title: string;
    description: string;
    projectId: string;
    assignee: string | null;
    status: string;
    priority: TaskPriority;
  }) => void;
};

type FormState = {
  title: string;
  description: string;
  projectId: string;
  assignee: string;
  status: string;
  priority: TaskPriority;
};

const EMPTY_STATE: FormState = {
  title: "",
  description: "",
  projectId: "",
  assignee: "__UNASSIGNED__",
  status: "TODO",
  priority: "MEDIUM",
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
  taskPriorities,
  onOpenChange,
  onSubmit,
}: TaskDialogProps) {
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
  const formSeedKey = useMemo(
    () =>
      [
        open ? "open" : "closed",
        mode,
        task?.id || "new",
        task?.updatedAt || "",
        lockProjectId || "",
        defaultProjectId || "",
        projects.map((project) => project.id).join(","),
        statusOptions.join(","),
        taskPriorities.map((priority) => priority.code).join(","),
      ].join("::"),
    [
      defaultProjectId,
      lockProjectId,
      mode,
      open,
      projects,
      statusOptions,
      task,
      taskPriorities,
    ],
  );
  const [draftState, setDraftState] = useState(() => ({
    seedKey: formSeedKey,
    form: initialFormState,
  }));
  const form = draftState.seedKey === formSeedKey ? draftState.form : initialFormState;

  const updateForm = (
    updater: FormState | ((previous: FormState) => FormState),
  ) => {
    setDraftState((previous) => {
      const baseForm =
        previous.seedKey === formSeedKey ? previous.form : initialFormState;
      const nextForm =
        typeof updater === "function" ? updater(baseForm) : updater;

      return {
        seedKey: formSeedKey,
        form: nextForm,
      };
    });
  };

  const canSubmit = useMemo(
    () =>
      form.title.trim().length > 0 &&
      form.projectId.trim().length > 0 &&
      statusOptions.includes(form.status) &&
      taskPriorities.some((priority) => priority.code === form.priority),
    [form.priority, form.projectId, form.status, form.title, statusOptions, taskPriorities],
  );
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === (lockProjectId || form.projectId)) || null,
    [form.projectId, lockProjectId, projects],
  );
  const selectedPriority = useMemo(
    () => taskPriorities.find((priority) => priority.code === form.priority) || null,
    [form.priority, taskPriorities],
  );
  const isUnassigned = form.assignee === "__UNASSIGNED__";

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      projectId: lockProjectId || form.projectId,
      assignee: isUnassigned ? null : form.assignee,
      status: form.status,
      priority: form.priority,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card gap-0 overflow-hidden p-0 [zoom:var(--app-scale)] sm:max-w-2xl">
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
              <Label htmlFor="task-title">Task title</Label>
              <Input
                id="task-title"
                value={form.title}
                onChange={(event) =>
                  updateForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Thiết kế màn quản lý user"
                className="h-10 rounded-lg px-3 text-sm"
              />
            </div>

            {!lockProjectId ? (
              <div className="grid gap-2">
                <Label htmlFor="task-project">Project</Label>
                <Select
                  value={form.projectId}
                  onValueChange={(value) =>
                    updateForm((prev) => ({ ...prev, projectId: value }))
                  }
                >
                  <SelectTrigger
                    id="task-project"
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
              </div>
            ) : null}

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Button
                  type="button"
                  variant={isUnassigned ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-7 rounded-full px-2.5 text-xs",
                    !isUnassigned && "text-muted-foreground",
                  )}
                  onClick={() =>
                    updateForm((prev) => ({
                      ...prev,
                      assignee: "__UNASSIGNED__",
                    }))
                  }
                >
                  Unassigned
                </Button>
              </div>
              <TaskUserSingleSelect
                users={assigneeOptions}
                value={isUnassigned ? "" : form.assignee}
                onChange={(value) =>
                  updateForm((prev) => ({ ...prev, assignee: value }))
                }
                placeholder="Select assignee"
                searchPlaceholder="Search assignee"
                emptyLabel="No users found"
                triggerClassName="min-h-11 rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="task-status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    updateForm((prev) => ({ ...prev, status: value }))
                  }
                  disabled={statusOptions.length === 0}
                >
                  <SelectTrigger
                    id="task-status"
                    className="h-11 w-full rounded-lg px-3 text-sm"
                  >
                    <SelectValue
                      placeholder={
                        statusOptions.length === 0
                          ? "No statuses available"
                          : "Status"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value) =>
                    updateForm((prev) => ({
                      ...prev,
                      priority: value as TaskPriority,
                    }))
                  }
                  disabled={taskPriorities.length === 0}
                >
                  <SelectTrigger
                    id="task-priority"
                    className="h-11 w-full rounded-lg px-3 text-sm"
                  >
                    {selectedPriority ? (
                      <span className="flex min-w-0 items-center gap-2 text-sm font-normal">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: selectedPriority.color }}
                        />
                        <span className="truncate">{selectedPriority.name}</span>
                      </span>
                    ) : (
                      <SelectValue
                        placeholder={
                          taskPriorities.length === 0
                            ? "No priorities available"
                            : "Priority"
                        }
                      />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {taskPriorities.map((priority) => (
                      <SelectItem key={priority.code} value={priority.code}>
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
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={form.description}
                onChange={(event) =>
                  updateForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Task detail..."
                className="min-h-32 rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={!canSubmit}>
              {mode === "create" ? "Create task" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
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
      assignee: task.assignee || "__UNASSIGNED__",
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
    taskPriorities.find((priorityItem) => priorityItem.code === EMPTY_STATE.priority)
      ?.code ||
    taskPriorities[0]?.code ||
    ""
  );
}
