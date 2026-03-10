import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Search01Icon,
  Tick02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import type { TaskManagerUserOption } from "../../../model/types";
import { getInitials } from "../../../model/helpers/userHelpers";

function filterUsers(users: TaskManagerUserOption[], keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) {
    return users;
  }

  return users.filter((user) =>
    `${user.label} ${user.email} ${user.status}`
      .toLowerCase()
      .includes(normalizedKeyword),
  );
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
}: {
  users: TaskManagerUserOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const selectedUser =
    users.find((user) => user.id === value) ||
    (value ? toFallbackUserOption(value) : null);
  const filteredUsers = useMemo(
    () => filterUsers(users, keyword),
    [users, keyword],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-auto min-h-8 w-full justify-between"
        >
          {selectedUser ? (
            <UserOptionRow user={selectedUser} selected={false} />
          ) : (
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <HugeiconsIcon icon={UserCircleIcon} className="size-4" />
              {placeholder}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[360px] rounded-xl p-2 [zoom:var(--app-scale)]"
      >
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8"
          />
        </div>

        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
          {filteredUsers.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border border-dashed px-3 py-6 text-center text-sm">
              {emptyLabel}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  onChange(user.id);
                  setOpen(false);
                  setKeyword("");
                }}
                className={cn(
                  "hover:bg-muted/60 w-full rounded-lg border px-3 py-2 text-left transition",
                  value === user.id
                    ? "border-primary/40 bg-primary/[0.06]"
                    : "border-transparent",
                )}
              >
                <UserOptionRow user={user} selected={value === user.id} />
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
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
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const filteredUsers = useMemo(
    () => filterUsers(users, keyword),
    [users, keyword],
  );
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-auto min-h-10 w-full justify-between px-3 py-2"
        >
          <div className="min-w-0 text-left">
            {selectedUsers.length === 0 ? (
              <span className="text-muted-foreground text-sm">
                {placeholder}
              </span>
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
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[360px] rounded-xl p-2 [zoom:var(--app-scale)]"
      >
        <div className="relative mb-2">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8"
          />
        </div>

        {selectedUsers.length > 0 ? (
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
                    onChange(values.filter((item) => item !== user.id));
                  }}
                  className="hover:text-foreground rounded-full"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
          {filteredUsers.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border border-dashed px-3 py-6 text-center text-sm">
              {emptyLabel}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const selected = values.includes(user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() =>
                    onChange(
                      selected
                        ? values.filter((item) => item !== user.id)
                        : [...values, user.id],
                    )
                  }
                  className={cn(
                    "hover:bg-muted/60 w-full rounded-lg border px-3 py-1 text-left transition",
                    selected
                      ? "border-primary/40 bg-primary/[0.06]"
                      : "border-transparent",
                  )}
                >
                  <UserOptionRow user={user} selected={selected} />
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
