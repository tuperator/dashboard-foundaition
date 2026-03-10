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
  type TaskManagerUserOption,
  type TaskProject,
  type UpdateProjectPayload,
} from "../../model/types";
import { buildTaskUserOptionsByIds, getTaskProjectParticipantIds, resolveTaskUserLabel } from "../../model/helpers/userHelpers";
import {
  TaskUserMultiSelect,
  TaskUserSingleSelect,
} from "./user-select/TaskUserSelect";

type ProjectSettingsDialogProps = {
  open: boolean;
  project: TaskProject | null;
  memberRoles: Record<string, ProjectMemberRole>;
  userOptions: TaskManagerUserOption[];
  userOptionById: Map<string, TaskManagerUserOption>;
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
  userOptions,
  userOptionById,
  onOpenChange,
  onSaveProject,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
}: ProjectSettingsDialogProps) {
  const [form, setForm] = useState<FormState>(() => createFormState(project));

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

  const participantIds = getTaskProjectParticipantIds({
    owner: form.owner || project.owner,
    members: project.members.filter((memberId) => memberId !== form.owner),
  });
  const participantOptions = buildTaskUserOptionsByIds(
    participantIds,
    userOptionById,
  );
  const currentMemberIds = project.members.filter(
    (memberId) => memberId !== form.owner,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card [zoom:var(--app-scale)] sm:max-w-3xl">
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
                <TaskUserSingleSelect
                  users={userOptions}
                  value={form.owner}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, owner: value }))
                  }
                  placeholder="Select project owner"
                  searchPlaceholder="Search by name or email"
                  emptyLabel="No users found"
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

            <div className="mb-3">
              <Label className="mb-1.5 block">Project members</Label>
              <TaskUserMultiSelect
                users={userOptions.filter((user) => user.id !== form.owner)}
                values={currentMemberIds}
                onChange={(nextMemberIds) => {
                  const currentMemberIdSet = new Set(currentMemberIds);
                  nextMemberIds.forEach((memberId) => {
                    if (!currentMemberIdSet.has(memberId)) {
                      onAddMember(project.id, memberId);
                    }
                  });
                  currentMemberIds.forEach((memberId) => {
                    if (!nextMemberIds.includes(memberId)) {
                      onRemoveMember(project.id, memberId);
                    }
                  });
                }}
                placeholder="Select project members"
                searchPlaceholder="Search members"
                emptyLabel="No users found"
              />
            </div>

            <div className="space-y-2">
              {participantOptions.map((member) => (
                <div
                  key={member.id}
                  className="bg-card flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                >
                  <span className="text-foreground text-sm font-medium">
                    {resolveTaskUserLabel(member.id, userOptionById)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Select
                      value={
                        memberRoles[member.id] ||
                        (member.id === form.owner ? "OWNER" : "MEMBER")
                      }
                      onValueChange={(value) =>
                        onUpdateMemberRole(
                          project.id,
                          member.id,
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

                    {member.id !== form.owner ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveMember(project.id, member.id)}
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
              onSaveProject(project.id, {
                name: form.name,
                key: form.key,
                description: form.description,
                owner,
                type: form.type,
                members: project.members.filter((memberId) => memberId !== owner),
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
