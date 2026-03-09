import { useMemo } from "react";
import { ApiClientError } from "@/shared/api/http";
import { AppShell } from "@/widgets/app-shell";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useRoleManagement } from "../model/useRoleManagement";
import { RoleManagementHeader } from "./components/RoleManagementHeader";
import { RoleManagementTable } from "./components/RoleManagementTable";

export function RoleManagementPage() {
  const { t } = useI18n();
  const { rolesQuery, roles, search, setSearch } = useRoleManagement();

  const stats = useMemo(() => {
    const total = roles.length;
    const admin = roles.filter((role) => role.type === "ADMIN").length;
    const operation = roles.filter((role) => role.type === "OPERATION").length;
    const custom = roles.filter((role) => role.type === "CUSTOM").length;

    return { total, admin, operation, custom };
  }, [roles]);

  return (
    <AppShell>
      <section className="space-y-4">
        <RoleManagementHeader
          total={stats.total}
          loading={rolesQuery.isFetching}
          search={search}
          onSearchChange={setSearch}
          onRefresh={() => {
            void rolesQuery.refetch();
          }}
        />

        <div className="grid gap-3 md:grid-cols-4">
          <StatCard title={t("role.stats.total")} value={stats.total} />
          <StatCard title={t("role.stats.admin")} value={stats.admin} />
          <StatCard title={t("role.stats.operation")} value={stats.operation} />
          <StatCard title={t("role.stats.custom")} value={stats.custom} />
        </div>

        {rolesQuery.isError ? (
          <div className="border-destructive/30 bg-destructive/5 rounded-xl border px-4 py-3">
            <p className="text-destructive text-sm font-medium">
              {t("role.notice.error.load")}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {resolveErrorMessage(rolesQuery.error, t)}
            </p>
          </div>
        ) : null}

        <div className="bg-card rounded-2xl border p-3">
          <RoleManagementTable roles={roles} loading={rolesQuery.isLoading} />
        </div>
      </section>
    </AppShell>
  );
}

function resolveErrorMessage(
  error: unknown,
  t: (key: "role.error.unknown") => string,
) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return t("role.error.unknown");
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <article className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100/40 p-4">
      <p className="text-muted-foreground text-xs">{title}</p>
      <p className="text-foreground mt-1 text-2xl font-semibold">{value}</p>
    </article>
  );
}
