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
  PROJECT_TYPE_VALUES,
  type ProjectType,
  type TaskProject,
} from "../../model/types";

type ProjectDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  project: TaskProject | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    name: string;
    key: string;
    description: string;
    owner: string;
    members: string[];
    type: ProjectType;
  }) => void;
};

type FormState = {
  name: string;
  key: string;
  description: string;
  owner: string;
  members: string;
  type: ProjectType;
};

const EMPTY_STATE: FormState = {
  name: "",
  key: "",
  description: "",
  owner: "",
  members: "",
  type: "SCRUM",
};

export function ProjectDialog({
  open,
  mode,
  project,
  onOpenChange,
  onSubmit,
}: ProjectDialogProps) {
  const [form, setForm] = useState<FormState>(() =>
    getInitialFormState(project),
  );

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
            Configure workspace information, owner, members and project type.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="project-name">Project name</Label>
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
              <Label htmlFor="project-key">Project key</Label>
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
              <Label htmlFor="project-type">Project type</Label>
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
            <Label htmlFor="project-owner">Owner</Label>
            <Input
              id="project-owner"
              value={form.owner}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, owner: event.target.value }))
              }
              placeholder="Toan Le"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="project-members">Members (comma separated)</Label>
            <Input
              id="project-members"
              value={form.members}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, members: event.target.value }))
              }
              placeholder="Toan Le, Linh Tran, Minh Nguyen"
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
                members: form.members
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
                type: form.type,
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

function getInitialFormState(project: TaskProject | null): FormState {
  if (!project) {
    return EMPTY_STATE;
  }

  return {
    name: project.name,
    key: project.key,
    description: project.description,
    owner: project.owner,
    members: project.members.join(", "),
    type: project.type,
  };
}
