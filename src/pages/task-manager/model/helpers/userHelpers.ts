import type { UserAccount } from "../../../user-management/model/types";
import type { TaskManagerUserOption, TaskProject } from "../types";

export function mapTaskManagerUsers(users: UserAccount[]): TaskManagerUserOption[] {
  return users.map((user) => ({
    id: user.id,
    label: user.username || user.email,
    email: user.email,
    status: user.status,
    initials: getInitials(user.username || user.email),
  }));
}

export function getTaskProjectParticipantIds(project: Pick<TaskProject, "owner" | "members">) {
  return Array.from(new Set([project.owner, ...project.members].filter(Boolean)));
}

export function resolveTaskUserLabel(
  value: string | null | undefined,
  userOptionById: Map<string, TaskManagerUserOption>,
) {
  if (!value) {
    return "";
  }
  return userOptionById.get(value)?.label || value;
}

export function buildTaskUserOptionsByIds(
  values: string[],
  userOptionById: Map<string, TaskManagerUserOption>,
) {
  return Array.from(new Set(values.filter(Boolean))).map((value) => {
    const matched = userOptionById.get(value);
    if (matched) {
      return matched;
    }

    return {
      id: value,
      label: value,
      email: "",
      status: "UNKNOWN",
      initials: getInitials(value),
    } satisfies TaskManagerUserOption;
  });
}

export function getInitials(value: string) {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 0) {
    return "NA";
  }

  return words
    .map((word) => word[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);
}
