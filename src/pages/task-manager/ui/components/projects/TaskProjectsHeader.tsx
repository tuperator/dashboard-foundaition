import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleHalfDotIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { PROJECT_TYPE_VALUES } from "../../../model/types";

type SortMode = "UPDATED" | "NAME" | "PROGRESS";

type TaskProjectsHeaderProps = {
  search: string;
  typeFilter: "ALL" | "SCRUM" | "KANBAN";
  ownerFilter: string;
  sortBy: SortMode;
  ownerOptions: string[];
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: "ALL" | "SCRUM" | "KANBAN") => void;
  onOwnerFilterChange: (value: string) => void;
  onSortChange: (value: SortMode) => void;
  onCreateProject: () => void;
};

export function TaskProjectsHeader({
  search,
  typeFilter,
  ownerFilter,
  sortBy,
  ownerOptions,
  onSearchChange,
  onTypeFilterChange,
  onOwnerFilterChange,
  onSortChange,
  onCreateProject,
}: TaskProjectsHeaderProps) {
  const { t } = useI18n();

  return (
    <header className="bg-card rounded-2xl border p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            {t("tasks.projects.pageTitle")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("tasks.projects.pageDescription")}
          </p>
        </div>
        <Button onClick={onCreateProject}>
          <HugeiconsIcon icon={AddCircleHalfDotIcon} />
          {t("tasks.projects.newProject")}
        </Button>
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
            placeholder={t("tasks.projects.searchPlaceholder")}
            className="pl-8"
          />
        </div>

        <Select
          value={typeFilter}
          onValueChange={(value) =>
            onTypeFilterChange(value as typeof typeFilter)
          }
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[150px]">
            <SelectValue placeholder={t("tasks.projects.filter.projectType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {t("tasks.projects.filter.allTypes")}
            </SelectItem>
            {PROJECT_TYPE_VALUES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={ownerFilter} onValueChange={onOwnerFilterChange}>
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[150px]">
            <SelectValue placeholder={t("tasks.projects.filter.owner")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {t("tasks.projects.filter.allOwners")}
            </SelectItem>
            {ownerOptions.map((owner) => (
              <SelectItem key={owner} value={owner}>
                {owner}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value) => onSortChange(value as SortMode)}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[150px]">
            <SelectValue placeholder={t("tasks.projects.filter.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UPDATED">
              {t("tasks.projects.sort.latestUpdated")}
            </SelectItem>
            <SelectItem value="NAME">
              {t("tasks.projects.sort.name")}
            </SelectItem>
            <SelectItem value="PROGRESS">
              {t("tasks.projects.sort.progress")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
