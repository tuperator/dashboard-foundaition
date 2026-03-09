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
  PROJECT_MEMBER_ROLE_VALUES,
  PROJECT_TYPE_VALUES,
  type ProjectMemberRole,
  type ProjectType,
  type TaskProject,
  type UpdateProjectPayload,
} from "../../model/types";

type ProjectSettingsDialogProps = {
  open: boolean;
  project: TaskProject | null;
  memberRoles: Record<string, ProjectMemberRole>;
  onOpenChange: (open: boolean) => void;
  onSaveProject: (projectId: string, payload: UpdateProjectPayload) => void;
  onAddMember: (projectId: string, member: string) => void;
  onRemoveMember: (projectId: string, member: string) => void;
  onUpdateMemberRole: (
    projectId: string,
    member: string,
    role: ProjectMemberRole,
  ) => void;
};

type FormState = {
  name: string;
  key: string;
  description: string;
  owner: string;
  type: ProjectType;
};

const EMPTY_FORM: FormState = {
  name: "",
  key: "",
  description: "",
  owner: "",
  type: "SCRUM",
};

export function ProjectSettingsDialog({
  open,
  project,
  memberRoles,
  onOpenChange,
  onSaveProject,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
}: ProjectSettingsDialogProps) {
  const [form, setForm] = useState<FormState>(() => createFormState(project));
  const [memberInput, setMemberInput] = useState("");

  const canSave = useMemo(
    () =>
      form.name.trim().length > 0 &&
      form.key.trim().length > 0 &&
      form.owner.trim().length > 0,
    [form.key, form.name, form.owner],
  );

  if (!project) {
    return null;
  }

  const members = Array.from(
    new Set([project.owner, ...project.members].filter(Boolean)),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[zoom:var(--app-scale)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Project settings</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin project, quản lý thành viên và phân quyền theo
            vai trò.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="bg-muted/15 rounded-xl border p-3">
            <p className="text-foreground mb-3 text-sm font-semibold">
              General information
            </p>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="project-settings-name">Project name</Label>
                <Input
                  id="project-settings-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>

              <div className="grid gap-1.5 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="project-settings-key">Project key</Label>
                  <Input
                    id="project-settings-key"
                    value={form.key}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        key: event.target.value.toUpperCase(),
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="project-settings-type">Project type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        type: value as ProjectType,
                      }))
                    }
                  >
                    <SelectTrigger id="project-settings-type">
                      <SelectValue />
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
                <Label htmlFor="project-settings-owner">Owner</Label>
                <Input
                  id="project-settings-owner"
                  value={form.owner}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, owner: event.target.value }))
                  }
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="project-settings-description">
                  Description
                </Label>
                <Textarea
                  id="project-settings-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="min-h-[96px]"
                />
              </div>
            </div>
          </section>

          <section className="bg-muted/15 rounded-xl border p-3">
            <p className="text-foreground mb-3 text-sm font-semibold">
              Members & permissions
            </p>

            <div className="mb-3 flex gap-2">
              <Input
                value={memberInput}
                onChange={(event) => setMemberInput(event.target.value)}
                placeholder="Add member name"
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (!memberInput.trim()) {
                    return;
                  }
                  onAddMember(project.id, memberInput.trim());
                  setMemberInput("");
                }}
              >
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member}
                  className="bg-card flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                >
                  <span className="text-foreground text-sm font-medium">
                    {member}
                  </span>
                  <div className="flex items-center gap-2">
                    <Select
                      value={
                        memberRoles[member] ||
                        (member === project.owner ? "OWNER" : "MEMBER")
                      }
                      onValueChange={(value) =>
                        onUpdateMemberRole(
                          project.id,
                          member,
                          value as ProjectMemberRole,
                        )
                      }
                    >
                      <SelectTrigger className="w-[132px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_MEMBER_ROLE_VALUES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {member !== project.owner ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveMember(project.id, member)}
                      >
                        Remove
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Owner
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSave}
            onClick={() => {
              const owner = form.owner.trim();
              const membersWithOwner = Array.from(
                new Set([owner, ...project.members].filter(Boolean)),
              );

              onSaveProject(project.id, {
                name: form.name,
                key: form.key,
                description: form.description,
                owner,
                type: form.type,
                members: membersWithOwner,
              });
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function createFormState(project: TaskProject | null): FormState {
  if (!project) {
    return EMPTY_FORM;
  }

  return {
    name: project.name,
    key: project.key,
    description: project.description,
    owner: project.owner,
    type: project.type,
  };
}
