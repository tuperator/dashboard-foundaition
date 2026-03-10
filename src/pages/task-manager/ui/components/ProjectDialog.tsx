import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/shared/lib/utils";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { listWorkflows } from "../../model/workflowManagement.api";
import {
  PROJECT_TYPE_VALUES,
  type TaskManagerUserOption,
  type ProjectType,
  type TaskProject,
} from "../../model/types";
import {
  TaskUserMultiSelect,
  TaskUserSingleSelect,
} from "./user-select/TaskUserSelect";

type ProjectDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  project: TaskProject | null;
  initialWorkflowId?: string | null;
  userOptions: TaskManagerUserOption[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    name: string;
    key: string;
    description: string;
    owner: string;
    members: string[];
    type: ProjectType;
    workflowId?: string;
  }) => void;
};

type FormState = {
  name: string;
  key: string;
  description: string;
  owner: string;
  members: string[];
  type: ProjectType;
  workflowId: string;
};

const EMPTY_STATE: FormState = {
  name: "",
  key: "",
  description: "",
  owner: "",
  members: [],
  type: "SCRUM",
  workflowId: "",
};

const WORKFLOW_SELECT_PAGE_SIZE = 200;

function filterWorkflows(
  workflows: Awaited<ReturnType<typeof listWorkflows>>["items"],
  keyword: string,
) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) {
    return workflows;
  }

  return workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(normalizedKeyword),
  );
}

export function ProjectDialog({
  open,
  mode,
  project,
  initialWorkflowId,
  userOptions,
  onOpenChange,
  onSubmit,
}: ProjectDialogProps) {
  const [form, setForm] = useState<FormState>(() =>
    getInitialFormState(project, initialWorkflowId),
  );
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowKeyword, setWorkflowKeyword] = useState("");
  const workflowsQuery = useQuery({
    queryKey: ["project-dialog-workflows", WORKFLOW_SELECT_PAGE_SIZE],
    queryFn: () => listWorkflows({ page: 1, size: WORKFLOW_SELECT_PAGE_SIZE }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const workflowOptions = workflowsQuery.data?.items || [];
  const filteredWorkflowOptions = useMemo(
    () => filterWorkflows(workflowOptions, workflowKeyword),
    [workflowKeyword, workflowOptions],
  );
  const selectedWorkflow =
    workflowOptions.find((workflow) => workflow.id === form.workflowId) || null;

  useEffect(() => {
    setForm(getInitialFormState(project, initialWorkflowId));
  }, [initialWorkflowId, project]);

  useEffect(() => {
    if (workflowOptions.length === 0) {
      return;
    }

    setForm((previous) => {
      if (previous.workflowId) {
        return previous;
      }

      const nextWorkflowId =
        initialWorkflowId &&
        workflowOptions.some((workflow) => workflow.id === initialWorkflowId)
          ? initialWorkflowId
          : workflowOptions[0]?.id || "";

      return nextWorkflowId
        ? { ...previous, workflowId: nextWorkflowId }
        : previous;
    });
  }, [initialWorkflowId, workflowOptions]);

  const canSubmit = useMemo(
    () =>
      form.name.trim().length > 0 &&
      form.key.trim().length > 0 &&
      form.owner.trim().length > 0,
    [form.key, form.name, form.owner],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[zoom:var(--app-scale)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create project" : "Update project"}
          </DialogTitle>
          <DialogDescription>
            Configure workspace information, owner, members, project type and
            workflow. <span className="text-destructive">*</span> indicates a
            required field.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="project-name" required>
              Project name
            </Label>
            <Input
              id="project-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="ERP Core Platform"
            />
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="project-key" required>
                Project key
              </Label>
              <Input
                id="project-key"
                value={form.key}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    key: event.target.value.toUpperCase(),
                  }))
                }
                placeholder="ERP"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="project-type" required>
                Project type
              </Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, type: value as ProjectType }))
                }
              >
                <SelectTrigger id="project-type">
                  <SelectValue placeholder="Project type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPE_VALUES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="project-workflow">Workflow</Label>
            <Popover
              open={workflowOpen}
              onOpenChange={(nextOpen) => {
                setWorkflowOpen(nextOpen);
                if (!nextOpen) {
                  setWorkflowKeyword("");
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  id="project-workflow"
                  disabled={
                    workflowsQuery.isLoading || workflowOptions.length === 0
                  }
                  className="text-foreground h-auto min-h-8 w-full justify-between"
                >
                  <span
                    className={cn(
                      "text-foreground truncate text-left text-sm font-normal",
                      !selectedWorkflow && "text-muted-foreground",
                    )}
                  >
                    {selectedWorkflow?.name ||
                      (workflowsQuery.isLoading
                        ? "Loading workflows..."
                        : "Select workflow")}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[360px] rounded-xl p-2 [zoom:var(--app-scale)]"
              >
                <div className="relative mb-2">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
                  />
                  <Input
                    value={workflowKeyword}
                    onChange={(event) => setWorkflowKeyword(event.target.value)}
                    placeholder="Search workflow by name"
                    className="pl-8"
                  />
                </div>

                <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                  {filteredWorkflowOptions.length === 0 ? (
                    <div className="text-muted-foreground rounded-lg border border-dashed px-3 py-6 text-center text-sm">
                      No workflows found
                    </div>
                  ) : (
                    filteredWorkflowOptions.map((workflow) => (
                      <button
                        key={workflow.id}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            workflowId: workflow.id,
                          }));
                          setWorkflowOpen(false);
                          setWorkflowKeyword("");
                        }}
                        className={cn(
                          "hover:bg-muted/60 flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition",
                          form.workflowId === workflow.id
                            ? "border-primary/40 bg-primary/[0.06]"
                            : "border-transparent",
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {workflow.name}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {workflow.description || workflow.id}
                          </p>
                        </div>
                        {form.workflowId === workflow.id ? (
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            className="text-primary size-4 shrink-0"
                          />
                        ) : null}
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {workflowsQuery.isError ? (
              <p className="text-destructive text-xs">
                {workflowsQuery.error instanceof Error
                  ? workflowsQuery.error.message
                  : "Failed to load workflows"}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="project-owner" required>
              Owner
            </Label>
            <TaskUserSingleSelect
              users={userOptions}
              value={form.owner}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  owner: value,
                  members: prev.members.filter(
                    (memberId) => memberId !== value,
                  ),
                }))
              }
              placeholder="Select project owner"
              searchPlaceholder="Search by name or email"
              emptyLabel="No users found"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="project-members">Members</Label>
            <TaskUserMultiSelect
              users={userOptions.filter((user) => user.id !== form.owner)}
              values={form.members}
              onChange={(values) =>
                setForm((prev) => ({ ...prev, members: values }))
              }
              placeholder="Select project members"
              searchPlaceholder="Search members"
              emptyLabel="No users found"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Project description..."
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
            onClick={() => {
              onSubmit({
                name: form.name,
                key: form.key,
                description: form.description,
                owner: form.owner,
                members: form.members.filter(
                  (memberId) => memberId !== form.owner,
                ),
                type: form.type,
                workflowId: form.workflowId || undefined,
              });
            }}
          >
            {mode === "create" ? "Create project" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getInitialFormState(
  project: TaskProject | null,
  initialWorkflowId?: string | null,
): FormState {
  if (!project) {
    return {
      ...EMPTY_STATE,
      workflowId: initialWorkflowId || "",
    };
  }

  return {
    name: project.name,
    key: project.key,
    description: project.description,
    owner: project.owner,
    members: project.members,
    type: project.type,
    workflowId: initialWorkflowId || "",
  };
}
