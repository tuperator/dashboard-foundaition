import { useMemo, useState } from "react";
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
  type TaskPriority,
  type TaskPriorityItem,
  type TaskProject,
} from "../../model/types";

type TaskDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  task: TaskItem | null;
  projects: TaskProject[];
  defaultProjectId: string | null;
  lockProjectId?: string;
  members: string[];
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
  members,
  statusOptions,
  taskPriorities,
  onOpenChange,
  onSubmit,
}: TaskDialogProps) {
  const [form, setForm] = useState<FormState>(() =>
    getInitialFormState(
      task,
      defaultProjectId,
      lockProjectId,
      projects,
      statusOptions,
      taskPriorities,
    ),
  );

  const canSubmit = useMemo(
    () => form.title.trim().length > 0 && form.projectId.trim().length > 0,
    [form.projectId, form.title],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[zoom:var(--app-scale)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create task" : "Update task"}
          </DialogTitle>
          <DialogDescription>
            Capture issue details, assignee, status and priority.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="task-title">Task title</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Thiết kế màn quản lý user"
            />
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            {lockProjectId ? (
              <div className="grid gap-1.5">
                <Label>Project</Label>
                <div className="bg-muted/40 text-foreground rounded-md border px-3 py-2 text-sm">
                  {projects.find((project) => project.id === lockProjectId)
                    ?.name || "Current project"}
                </div>
              </div>
            ) : (
              <div className="grid gap-1.5">
                <Label htmlFor="task-project">Project</Label>
                <Select
                  value={form.projectId}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, projectId: value }))
                  }
                >
                  <SelectTrigger id="task-project">
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
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="task-assignee">Assignee</Label>
              <Select
                value={form.assignee}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, assignee: value }))
                }
              >
                <SelectTrigger id="task-assignee">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__UNASSIGNED__">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="task-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="task-status">
                  <SelectValue placeholder="Status" />
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

            <div className="grid gap-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    priority: value as TaskPriority,
                  }))
                }
              >
                <SelectTrigger id="task-priority">
                  <SelectValue placeholder="Priority" />
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

          <div className="grid gap-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Task detail..."
              className="min-h-[76px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                title: form.title,
                description: form.description,
                projectId: lockProjectId || form.projectId,
                assignee:
                  form.assignee === "__UNASSIGNED__" ? null : form.assignee,
                status: form.status,
                priority: form.priority,
              })
            }
          >
            {mode === "create" ? "Create task" : "Save changes"}
          </Button>
        </DialogFooter>
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
  if (task) {
    return {
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assignee: task.assignee || "__UNASSIGNED__",
      status: task.status,
      priority: task.priority,
    };
  }

  return {
    ...EMPTY_STATE,
    projectId: lockProjectId || defaultProjectId || projects[0]?.id || "",
    status: statusOptions[0] || "TODO",
    priority: taskPriorities[Math.floor(taskPriorities.length / 2)]?.code || "MEDIUM",
  };
}
