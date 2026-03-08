import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ROLE_MANAGEMENT_QUERY_KEYS } from "./constants";
import { getRoleCatalog } from "./roleManagement.api";

export function useRoleManagement() {
  const [search, setSearch] = useState("");

  const rolesQuery = useQuery({
    queryKey: [ROLE_MANAGEMENT_QUERY_KEYS.list],
    queryFn: getRoleCatalog,
  });

  const roles = useMemo(() => {
    const records = rolesQuery.data || [];
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return records;
    }

    return records.filter((role) => {
      const searchableValues = `${role.roleName} ${role.id}`.toLowerCase();
      return searchableValues.includes(normalizedSearch);
    });
  }, [rolesQuery.data, search]);

  return {
    rolesQuery,
    roles,
    search,
    setSearch,
  };
}
