import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleHalfDotIcon,
  Search01Icon,
  Settings02Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  Task01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  type TaskManagerUserOption,
  type TaskPriority,
  type TaskPriorityItem,
  type TaskProject,
} from "../../../model/types";

type TaskProjectDetailsHeaderProps = {
  project: TaskProject;
  workflow: string[];
  search: string;
  statusFilter: string;
  priorityFilter: "ALL" | TaskPriority;
  assigneeFilter: string;
  assigneeOptions: TaskManagerUserOption[];
  sortBy: "LATEST" | "PRIORITY" | "BACKLOG_ORDER";
  taskPriorities: TaskPriorityItem[];
  resolveUserLabel: (value: string | null | undefined) => string;
  onBack: () => void;
  onOpenEditProject: () => void;
  onOpenSettings: () => void;
  onOpenWorkflowManager: () => void;
  onOpenPriorityManager: () => void;
  onDeleteProject: () => void;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onPriorityFilterChange: (value: "ALL" | TaskPriority) => void;
  onAssigneeFilterChange: (value: string) => void;
  onSortByChange: (value: "LATEST" | "PRIORITY" | "BACKLOG_ORDER") => void;
};

export function TaskProjectDetailsHeader({
  project,
  workflow,
  search,
  statusFilter,
  priorityFilter,
  assigneeFilter,
  assigneeOptions,
  sortBy,
  taskPriorities,
  resolveUserLabel,
  onBack,
  onOpenEditProject,
  onOpenSettings,
  onOpenWorkflowManager,
  onOpenPriorityManager,
  onDeleteProject,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onAssigneeFilterChange,
  onSortByChange,
}: TaskProjectDetailsHeaderProps) {
  const { t } = useI18n();

  return (
    <header className="bg-card rounded-2xl border p-4 flex flex-col gap-4 lg:gap-5">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground w-fit -ml-2 px-2 h-7"
        onClick={onBack}
      >
        <HugeiconsIcon icon={AddCircleHalfDotIcon} className="hidden" /> {/* to easily keep spacing standard, or we just rely on text */}
        {t("tasks.common.backToWorkspace")}
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            {project.name}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("tasks.projectDetails.headerDescription")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="h-6 rounded-full">
            {project.key}
          </Badge>
          <Badge className="bg-primary/10 text-primary h-6 rounded-full">
            {project.type}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <HugeiconsIcon icon={MoreHorizontalIcon} />
                {t("tasks.common.actions")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onOpenEditProject}>
                <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 size-4" />
                {t("tasks.common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenWorkflowManager}>
                <HugeiconsIcon icon={Task01Icon} className="mr-2 size-4" />
                {t("tasks.projectDetails.workflowManager")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenPriorityManager}>
                <HugeiconsIcon icon={AddCircleHalfDotIcon} className="mr-2 size-4" />
                {t("tasks.projectDetails.priorityManager")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenSettings}>
                <HugeiconsIcon icon={Settings02Icon} className="mr-2 size-4" />
                {t("tasks.projectDetails.settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={onDeleteProject}
              >
                <HugeiconsIcon icon={Delete02Icon} className="mr-2 size-4" />
                {t("tasks.common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("tasks.projectDetails.searchPlaceholder")}
            className="pl-8"
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[150px]">
            <SelectValue placeholder={t("tasks.projectDetails.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {t("tasks.projectDetails.allStatus")}
            </SelectItem>
            {workflow.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter}
          onValueChange={(value) =>
            onPriorityFilterChange(value as "ALL" | TaskPriority)
          }
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[150px]">
            <SelectValue placeholder={t("tasks.projectDetails.priority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {t("tasks.projectDetails.allPriority")}
            </SelectItem>
            {taskPriorities.map((priority) => (
              <SelectItem key={priority.code} value={priority.code}>
                {priority.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={onAssigneeFilterChange}>
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[150px]">
            <SelectValue placeholder={t("tasks.projectDetails.assignee")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {t("tasks.projectDetails.allAssignee")}
            </SelectItem>
            <SelectItem value="__UNASSIGNED__">
              {t("tasks.common.unassigned")}
            </SelectItem>
            {assigneeOptions.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {resolveUserLabel(member.id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value) =>
            onSortByChange(value as "LATEST" | "PRIORITY" | "BACKLOG_ORDER")
          }
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[150px]">
            <SelectValue placeholder={t("tasks.projectDetails.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LATEST">
              {t("tasks.projectDetails.sort.latestUpdated")}
            </SelectItem>
            <SelectItem value="PRIORITY">
              {t("tasks.projectDetails.sort.priority")}
            </SelectItem>
            <SelectItem value="BACKLOG_ORDER">
              {t("tasks.projectDetails.sort.backlogOrder")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
