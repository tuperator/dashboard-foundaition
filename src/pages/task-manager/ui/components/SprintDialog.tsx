import { useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
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
import { Spinner } from "@/shared/ui/spinner";
import { Textarea } from "@/shared/ui/textarea";
import {
  createSprint as createSprintApi,
  updateSprint as updateSprintApi,
} from "../../model/sprintManagement.api";
import type { SprintItem } from "../../model/types";

type SprintDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  sprint: SprintItem | null;
  projectId: string;
  onOpenChange: (open: boolean) => void;
};

const TASK_PROJECT_SPRINTS_QUERY_KEY = "task-project-sprints";

const sprintDialogSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Sprint name is required.")
      .max(255, "Sprint name must be 255 characters or fewer."),
    goal: z.string().trim().max(1000, "Goal must be 1000 characters or fewer."),
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().min(1, "End date is required."),
  })
  .refine((values) => values.endDate >= values.startDate, {
    path: ["endDate"],
    message: "End date must be the same as or after the start date.",
  });

type FormState = z.input<typeof sprintDialogSchema>;

const EMPTY_FORM: FormState = {
  name: "",
  goal: "",
  startDate: "",
  endDate: "",
};

export function SprintDialog({
  open,
  mode,
  sprint,
  projectId,
  onOpenChange,
}: SprintDialogProps) {
  const { t, tp } = useI18n();
  const appToast = useAppToast();
  const queryClient = useQueryClient();
  const initialValues = useMemo<FormState>(() => {
    if (mode === "edit" && sprint) {
      return {
        name: sprint.name,
        goal: sprint.goal,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
      };
    }

    return EMPTY_FORM;
  }, [mode, sprint]);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormState>({
    resolver: zodResolver(sprintDialogSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });
  const createSprintMutation = useMutation({
    mutationFn: createSprintApi,
  });
  const updateSprintMutation = useMutation({
    mutationFn: ({
      sprintId,
      payload,
    }: {
      sprintId: string;
      payload: Parameters<typeof updateSprintApi>[1];
    }) => updateSprintApi(sprintId, payload),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(initialValues);
  }, [initialValues, open, reset]);

  const submitForm = handleSubmit(async (values) => {
    const payload = {
      projectId,
      name: values.name.trim(),
      goal: values.goal.trim(),
      startDate: values.startDate,
      endDate: values.endDate,
    };

    try {
      if (mode === "create") {
        await createSprintMutation.mutateAsync(payload);
        appToast.success({
          title: t("tasks.projectDetails.toast.sprintCreatedTitle"),
          description: tp(
            "tasks.projectDetails.toast.sprintCreatedDescription",
            {
              name: payload.name,
            },
          ),
        });
      } else {
        if (!sprint) {
          throw new Error("Sprint not found");
        }

        await updateSprintMutation.mutateAsync({
          sprintId: sprint.id,
          payload: {
            name: payload.name,
            goal: payload.goal,
            startDate: payload.startDate,
            endDate: payload.endDate,
          },
        });
        appToast.success({
          title: t("tasks.projectDetails.toast.sprintUpdatedTitle"),
          description: tp(
            "tasks.projectDetails.toast.sprintUpdatedDescription",
            {
              name: payload.name,
            },
          ),
        });
      }

      await queryClient.invalidateQueries({
        queryKey: [TASK_PROJECT_SPRINTS_QUERY_KEY, projectId],
      });
      onOpenChange(false);
    } catch (error: unknown) {
      appToast.warning({
        title: t("tasks.projectDetails.toast.sprintRequestFailedTitle"),
        description:
          error instanceof Error
            ? error.message
            : t("tasks.projectDetails.toast.sprintRequestFailedDescription"),
      });
      throw error;
    }
  });
  const submitting =
    isSubmitting ||
    createSprintMutation.isPending ||
    updateSprintMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (submitting) {
          return;
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create sprint" : "Update sprint"}
          </DialogTitle>
          <DialogDescription>
            Define sprint timeline, goal and scope for the current scrum
            project.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={submitForm}>
          <div className="grid gap-2">
            <Label htmlFor="sprint-name" required>
              Sprint name
            </Label>
            <Input
              id="sprint-name"
              placeholder="Sprint 24"
              disabled={submitting}
              aria-invalid={errors.name ? "true" : "false"}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sprint-goal" required>
              Goal
            </Label>
            <Textarea
              id="sprint-goal"
              rows={4}
              placeholder="Summarize key delivery goals for the sprint."
              disabled={submitting}
              aria-invalid={errors.goal ? "true" : "false"}
              {...register("goal")}
            />
            {errors.goal ? (
              <p className="text-destructive text-xs">{errors.goal.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="sprint-start-date" required>
                Start date
              </Label>
              <Input
                id="sprint-start-date"
                type="date"
                disabled={submitting}
                aria-invalid={errors.startDate ? "true" : "false"}
                {...register("startDate")}
              />
              {errors.startDate ? (
                <p className="text-destructive text-xs">
                  {errors.startDate.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sprint-end-date" required>
                End date
              </Label>
              <Input
                id="sprint-end-date"
                type="date"
                disabled={submitting}
                aria-invalid={errors.endDate ? "true" : "false"}
                {...register("endDate")}
              />
              {errors.endDate ? (
                <p className="text-destructive text-xs">
                  {errors.endDate.message}
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              {t("tasks.common.close")}
            </Button>
            <Button type="submit" disabled={!isValid || submitting}>
              {submitting ? <Spinner className="size-4" /> : null}
              {mode === "create"
                ? t("tasks.projectDetails.createSprint")
                : t("tasks.common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
