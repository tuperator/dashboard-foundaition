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
import { Textarea } from "@/shared/ui/textarea";
import type { SprintItem } from "../../model/types";

type SprintDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  sprint: SprintItem | null;
  projectId: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    projectId: string;
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
  }) => void;
};

type FormState = {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
};

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
  onSubmit,
}: SprintDialogProps) {
  const [form, setForm] = useState<FormState>(() => {
    if (!sprint) {
      return EMPTY_FORM;
    }

    return {
      name: sprint.name,
      goal: sprint.goal,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
    };
  });

  const canSubmit = useMemo(
    () =>
      form.name.trim().length > 0 &&
      form.startDate.trim().length > 0 &&
      form.endDate.trim().length > 0,
    [form.endDate, form.name, form.startDate],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[zoom:var(--app-scale)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create sprint" : "Update sprint"}
          </DialogTitle>
          <DialogDescription>
            Define sprint timeline, goal and scope for the current scrum
            project.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="sprint-name">Sprint name</Label>
            <Input
              id="sprint-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Sprint 03"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="sprint-goal">Goal</Label>
            <Textarea
              id="sprint-goal"
              value={form.goal}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, goal: event.target.value }))
              }
              placeholder="Ship account onboarding with role permissions."
              className="min-h-[72px]"
            />
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="sprint-start-date">Start date</Label>
              <Input
                id="sprint-start-date"
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    startDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sprint-end-date">End date</Label>
              <Input
                id="sprint-end-date"
                type="date"
                value={form.endDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, endDate: event.target.value }))
                }
              />
            </div>
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
                projectId,
                name: form.name,
                goal: form.goal,
                startDate: form.startDate,
                endDate: form.endDate,
              })
            }
          >
            {mode === "create" ? "Create sprint" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
