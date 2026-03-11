import { useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Tick02Icon, UserCircleIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { SearchableSelect } from "@/shared/ui/searchable-select";
import type { TaskManagerUserOption } from "../../../model/types";
import { getInitials } from "../../../model/helpers/userHelpers";

function matchesUserKeyword(
  user: TaskManagerUserOption,
  normalizedKeyword: string,
) {
  return `${user.label} ${user.email} ${user.status}`
    .toLowerCase()
    .includes(normalizedKeyword);
}

function getStatusTone(status: string) {
  if (status === "WORKING") {
    return "bg-emerald-500";
  }
  if (status === "ONLEAVE") {
    return "bg-amber-500";
  }
  if (status === "RESIGNED") {
    return "bg-rose-500";
  }
  return "bg-slate-400";
}

function toFallbackUserOption(value: string): TaskManagerUserOption {
  return {
    id: value,
    label: value,
    email: "",
    status: "UNKNOWN",
    initials: getInitials(value),
  };
}

function UserOptionRow({
  user,
  selected,
}: {
  user: TaskManagerUserOption;
  selected: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="bg-primary/10 text-primary inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
        {user.initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{user.label}</p>
          <span
            className={cn("size-2 rounded-full", getStatusTone(user.status))}
          />
        </div>
        <p className="text-muted-foreground truncate text-xs">{user.email}</p>
      </div>
      {selected ? (
        <HugeiconsIcon icon={Tick02Icon} className="text-primary size-4" />
      ) : null}
    </div>
  );
}

export function TaskUserSingleSelect({
  users,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  disabled,
  triggerClassName,
}: {
  users: TaskManagerUserOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  disabled?: boolean;
  triggerClassName?: string;
}) {
  const selectedUser =
    users.find((user) => user.id === value) ||
    (value ? toFallbackUserOption(value) : null);

  return (
    <SearchableSelect
      value={value}
      options={users}
      onValueChange={onChange}
      getOptionValue={(user) => user.id}
      getOptionLabel={(user) => user.label}
      getOptionDescription={(user) => user.email}
      filterOption={(user, normalizedKeyword) =>
        matchesUserKeyword(user, normalizedKeyword)
      }
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyLabel={emptyLabel}
      disabled={disabled}
      triggerClassName={triggerClassName}
      renderTrigger={() =>
        selectedUser ? (
          <UserOptionRow user={selectedUser} selected={false} />
        ) : (
          <span className="text-muted-foreground flex items-center gap-2 text-sm">
            <HugeiconsIcon icon={UserCircleIcon} className="size-4" />
            {placeholder}
          </span>
        )
      }
      renderOption={(user) => <UserOptionRow user={user} selected={false} />}
    />
  );
}

export function TaskUserMultiSelect({
  users,
  values,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  disabled,
}: {
  users: TaskManagerUserOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  disabled?: boolean;
}) {
  const selectedUsers = useMemo(
    () =>
      values.map(
        (value) =>
          users.find((user) => user.id === value) ||
          toFallbackUserOption(value),
      ),
    [users, values],
  );

  return (
    <SearchableSelect
      multiple
      values={values}
      options={users}
      onValuesChange={onChange}
      getOptionValue={(user) => user.id}
      getOptionLabel={(user) => user.label}
      getOptionDescription={(user) => user.email}
      filterOption={(user, normalizedKeyword) =>
        matchesUserKeyword(user, normalizedKeyword)
      }
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyLabel={emptyLabel}
      disabled={disabled}
      triggerClassName="min-h-10 px-3 py-2"
      renderTrigger={() => (
        <div className="min-w-0 text-left">
          {selectedUsers.length === 0 ? (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selectedUsers.slice(0, 3).map((user) => (
                <Badge
                  key={user.id}
                  variant="outline"
                  className="h-6 rounded-full px-2"
                >
                  {user.label}
                </Badge>
              ))}
              {selectedUsers.length > 3 ? (
                <Badge variant="outline" className="h-6 rounded-full px-2">
                  +{selectedUsers.length - 3}
                </Badge>
              ) : null}
            </div>
          )}
        </div>
      )}
      renderSelectionSummary={({ removeValue }) =>
        selectedUsers.length > 0 ? (
          <div className="mb-1 flex flex-wrap gap-1.5 border-b pb-2">
            {selectedUsers.map((user) => (
              <Badge
                key={user.id}
                className="bg-primary/10 text-primary gap-1 rounded-full px-2 py-1"
              >
                {user.label}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeValue(user.id);
                  }}
                  className="hover:text-foreground rounded-full"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : null
      }
      renderOption={(user) => <UserOptionRow user={user} selected={false} />}
    />
  );
}
