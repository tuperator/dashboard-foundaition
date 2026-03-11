import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon } from "@hugeicons/core-free-icons";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
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
import { SearchableSelect } from "@/shared/ui/searchable-select";
import { Textarea } from "@/shared/ui/textarea";
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

const projectDialogSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(255, "Project name must be 255 characters or fewer"),
  key: z
    .string()
    .trim()
    .min(1, "Project key is required")
    .max(20, "Project key must be 20 characters or fewer")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Project key can only contain uppercase letters, numbers, - and _",
    ),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or fewer"),
  owner: z.string().trim().min(1, "Owner is required"),
  members: z.array(z.string()),
  type: z.enum(PROJECT_TYPE_VALUES),
  workflowId: z.string(),
});

type FormState = z.infer<typeof projectDialogSchema>;

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

function ProjectDialog({
  open,
  mode,
  project,
  initialWorkflowId,
  userOptions,
  onOpenChange,
  onSubmit,
}: ProjectDialogProps) {
  const {
    control,
    formState: { errors, isValid },
    getValues,
    handleSubmit,
    reset,
    setValue,
  } = useForm<FormState>({
    resolver: zodResolver(projectDialogSchema),
    mode: "onChange",
    defaultValues: getInitialFormState(project, initialWorkflowId),
  });
  const workflowsQuery = useQuery({
    queryKey: ["project-dialog-workflows", WORKFLOW_SELECT_PAGE_SIZE],
    queryFn: () => listWorkflows({ page: 1, size: WORKFLOW_SELECT_PAGE_SIZE }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const workflowOptions = useMemo(
    () => workflowsQuery.data?.items || [],
    [workflowsQuery.data?.items],
  );
  const selectedOwnerId = useWatch({
    control,
    name: "owner",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(getInitialFormState(project, initialWorkflowId));
  }, [initialWorkflowId, open, project, reset]);

  useEffect(() => {
    if (workflowOptions.length === 0) {
      return;
    }

    const currentWorkflowId = getValues("workflowId");
    if (currentWorkflowId) {
      return;
    }

    const nextWorkflowId =
      initialWorkflowId &&
      workflowOptions.some((workflow) => workflow.id === initialWorkflowId)
        ? initialWorkflowId
        : workflowOptions[0]?.id || "";

    if (nextWorkflowId) {
      setValue("workflowId", nextWorkflowId, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [getValues, initialWorkflowId, setValue, workflowOptions]);

  const submitForm = handleSubmit((values) => {
    onSubmit({
      name: values.name.trim(),
      key: values.key.trim().toUpperCase(),
      description: values.description.trim(),
      owner: values.owner.trim(),
      members: values.members.filter((memberId) => memberId !== values.owner),
      type: values.type,
      workflowId: values.workflowId || undefined,
    });
  });

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
        <form className="grid gap-4" onSubmit={submitForm}>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="project-name" required>
                Project name
              </Label>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="project-name"
                    value={field.value || ""}
                    aria-invalid={!!errors.name}
                    placeholder="ERP Core Platform"
                  />
                )}
              />
              {errors.name?.message ? (
                <p className="text-destructive text-xs">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="project-key" required>
                  Project key
                </Label>
                <Controller
                  control={control}
                  name="key"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="project-key"
                      value={field.value || ""}
                      aria-invalid={!!errors.key}
                      onChange={(event) =>
                        field.onChange(event.target.value.toUpperCase())
                      }
                      placeholder="ERP"
                    />
                  )}
                />
                {errors.key?.message ? (
                  <p className="text-destructive text-xs">{errors.key.message}</p>
                ) : null}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="project-type" required>
                  Project type
                </Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as ProjectType)
                      }
                    >
                      <SelectTrigger
                        id="project-type"
                        aria-invalid={!!errors.type}
                      >
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
                  )}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="project-workflow">Workflow</Label>
              <Controller
                control={control}
                name="workflowId"
                render={({ field }) => (
                  <SearchableSelect
                    id="project-workflow"
                    value={field.value}
                    options={workflowOptions}
                    onValueChange={field.onChange}
                    getOptionValue={(workflow) => workflow.id}
                    getOptionLabel={(workflow) => workflow.name}
                    getOptionDescription={(workflow) =>
                      workflow.description || workflow.id
                    }
                    filterOption={(workflow, normalizedKeyword) =>
                      workflow.name.toLowerCase().includes(normalizedKeyword)
                    }
                    placeholder={
                      workflowsQuery.isLoading
                        ? "Loading workflows..."
                        : "Select workflow"
                    }
                    searchPlaceholder="Search workflow by name"
                    emptyLabel="No workflows found"
                    disabled={
                      workflowsQuery.isLoading || workflowOptions.length === 0
                    }
                    renderOption={(workflow, { selected }) => (
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={cn(
                            "bg-muted text-muted-foreground mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border",
                            selected &&
                              "bg-primary/10 text-primary border-primary/20",
                          )}
                        >
                          <HugeiconsIcon icon={File01Icon} className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {workflow.name}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {workflow.description || workflow.id}
                          </p>
                        </div>
                      </div>
                    )}
                  />
                )}
              />
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
              <Controller
                control={control}
                name="owner"
                render={({ field }) => (
                  <TaskUserSingleSelect
                    users={userOptions}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue(
                        "members",
                        getValues("members").filter(
                          (memberId) => memberId !== value,
                        ),
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        },
                      );
                    }}
                    placeholder="Select project owner"
                    searchPlaceholder="Search by name or email"
                    emptyLabel="No users found"
                  />
                )}
              />
              {errors.owner?.message ? (
                <p className="text-destructive text-xs">
                  {errors.owner.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="project-members">Members</Label>
              <Controller
                control={control}
                name="members"
                render={({ field }) => (
                  <TaskUserMultiSelect
                    users={userOptions.filter(
                      (user) => user.id !== selectedOwnerId,
                    )}
                    values={field.value}
                    onChange={field.onChange}
                    placeholder="Select project members"
                    searchPlaceholder="Search members"
                    emptyLabel="No users found"
                  />
                )}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="project-description">Description</Label>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="project-description"
                    value={field.value || ""}
                    aria-invalid={!!errors.description}
                    placeholder="Project description..."
                    className="min-h-[76px]"
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              {mode === "create" ? "Create project" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectDialog;

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
