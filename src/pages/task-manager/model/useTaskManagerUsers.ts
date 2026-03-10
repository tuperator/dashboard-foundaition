import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getMyProfile,
  listUsersByCompany,
} from "../../user-management/model/userManagement.api";
import { USER_FILTER_ALL } from "../../user-management/model/constants";
import { mapTaskManagerUsers, resolveTaskUserLabel } from "./helpers/userHelpers";

const TASK_MANAGER_USER_QUERY_KEYS = {
  me: "task-manager-user-directory-me",
  users: "task-manager-user-directory-users",
} as const;

const TASK_MANAGER_USER_DIRECTORY_PAGE_SIZE = 200;

export function useTaskManagerUsers() {
  const myProfileQuery = useQuery({
    queryKey: [TASK_MANAGER_USER_QUERY_KEYS.me],
    queryFn: getMyProfile,
  });

  const companyId = myProfileQuery.data?.companyId || null;

  const usersQuery = useQuery({
    queryKey: [TASK_MANAGER_USER_QUERY_KEYS.users, companyId],
    queryFn: () =>
      listUsersByCompany({
        companyId: companyId as string,
        filters: {
          search: "",
          role: USER_FILTER_ALL,
          status: USER_FILTER_ALL,
          twoFactor: USER_FILTER_ALL,
          page: 1,
          pageSize: TASK_MANAGER_USER_DIRECTORY_PAGE_SIZE,
        },
      }),
    enabled: Boolean(companyId),
    staleTime: 60_000,
  });

  const userOptions = useMemo(
    () => mapTaskManagerUsers(usersQuery.data?.items || []),
    [usersQuery.data?.items],
  );

  const userOptionById = useMemo(
    () => new Map(userOptions.map((user) => [user.id, user])),
    [userOptions],
  );
  const resolveUserLabel = useCallback(
    (value: string | null | undefined) =>
      resolveTaskUserLabel(value, userOptionById),
    [userOptionById],
  );

  return {
    companyId,
    myProfileQuery,
    usersQuery,
    userOptions,
    userOptionById,
    resolveUserLabel,
  };
}
