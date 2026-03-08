import { useMemo, useState } from "react";
import { ApiClientError } from "@/shared/api/http";
import { AppShell } from "@/widgets/app-shell";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import type { BranchItem, BranchStatus, CreateBranchPayload, UpdateBranchPayload } from "../model/types";
import { useBranchManagement } from "../model/useBranchManagement";
import { BranchFormDialog } from "./components/BranchFormDialog";
import { BranchManagementHeader } from "./components/BranchManagementHeader";
import { BranchManagementTable } from "./components/BranchManagementTable";

export function BranchManagementPage() {
  const { t, tp } = useI18n();
  const appToast = useAppToast();
  const {
    branches,
    branchesQuery,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    resetFilters,
    createBranchMutation,
    updateBranchMutation,
    updateBranchStatusMutation,
  } = useBranchManagement();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);

  const stats = useMemo(() => {
    const active = branches.filter((branch) => branch.status === "ACTIVE").length;
    const inactive = branches.filter((branch) => branch.status === "INACTIVE").length;
    const deleted = branches.filter((branch) => branch.status === "DELETED").length;
    return {
      total: branches.length,
      active,
      inactive,
      deleted,
    };
  }, [branches]);

  const handleCreate = async (payload: CreateBranchPayload) => {
    try {
      const created = await createBranchMutation.mutateAsync(payload);
      setCreateOpen(false);
      appToast.success({
        title: tp("branch.notice.created.title", { name: created.name }),
        description: t("branch.notice.created.description"),
      });
    } catch (error) {
      appToast.error({
        title: t("branch.notice.error.create"),
        description: resolveErrorMessage(error, t),
      });
    }
  };

  const handleUpdate = async (branchId: string, payload: UpdateBranchPayload) => {
    try {
      const updated = await updateBranchMutation.mutateAsync({ branchId, payload });
      setEditingBranch(null);
      appToast.success({
        title: tp("branch.notice.updated.title", { name: updated.name }),
        description: t("branch.notice.updated.description"),
      });
    } catch (error) {
      appToast.error({
        title: t("branch.notice.error.update"),
        description: resolveErrorMessage(error, t),
      });
    }
  };

  const handleChangeStatus = async (branch: BranchItem, status: BranchStatus) => {
    if (branch.status === status) {
      return;
    }

    try {
      const updated = await updateBranchStatusMutation.mutateAsync({
        branchId: branch.id,
        status,
      });

      appToast.success({
        title: tp("branch.notice.status.title", { name: updated.name }),
        description: tp("branch.notice.status.description", {
          status:
            updated.status === "ACTIVE"
              ? t("branch.badge.active")
              : updated.status === "INACTIVE"
                ? t("branch.badge.inactive")
                : t("branch.badge.deleted"),
        }),
      });
    } catch (error) {
      appToast.error({
        title: t("branch.notice.error.status"),
        description: resolveErrorMessage(error, t),
      });
    }
  };

  return (
    <AppShell>
      <section className="space-y-4">
        <BranchManagementHeader
          total={stats.total}
          search={search}
          statusFilter={statusFilter}
          loading={branchesQuery.isFetching}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          onResetFilters={resetFilters}
          onOpenCreate={() => setCreateOpen(true)}
          onRefresh={() => {
            void branchesQuery.refetch();
          }}
        />

        <div className="grid gap-3 md:grid-cols-3">
          <StatCard title={t("branch.badge.active")} value={stats.active} tone="active" />
          <StatCard
            title={t("branch.badge.inactive")}
            value={stats.inactive}
            tone="inactive"
          />
          <StatCard title={t("branch.badge.deleted")} value={stats.deleted} tone="deleted" />
        </div>

        {branchesQuery.isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <p className="text-destructive text-sm font-medium">
              {t("branch.notice.error.load")}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {resolveErrorMessage(branchesQuery.error, t)}
            </p>
          </div>
        ) : null}

        <div className="bg-card rounded-2xl border p-3">
          <BranchManagementTable
            branches={branches}
            loading={branchesQuery.isLoading}
            onEdit={setEditingBranch}
            onChangeStatus={handleChangeStatus}
          />
        </div>
      </section>

      <BranchFormDialog
        key="branch-create-dialog"
        mode="create"
        open={createOpen}
        branch={null}
        submitting={createBranchMutation.isPending}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <BranchFormDialog
        key={editingBranch ? `branch-edit-${editingBranch.id}` : "branch-edit-empty"}
        mode="edit"
        open={Boolean(editingBranch)}
        branch={editingBranch}
        submitting={updateBranchMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBranch(null);
          }
        }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </AppShell>
  );
}

function resolveErrorMessage(
  error: unknown,
  t: (key: "branch.error.unknown") => string,
) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return t("branch.error.unknown");
}

function StatCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: number;
  tone: "active" | "inactive" | "deleted";
}) {
  const className =
    tone === "active"
      ? "from-emerald-50 to-emerald-100/40 border-emerald-200/70"
      : tone === "inactive"
        ? "from-amber-50 to-amber-100/40 border-amber-200/70"
        : "from-rose-50 to-rose-100/40 border-rose-200/70";

  return (
    <article className={`rounded-2xl border bg-gradient-to-br p-4 ${className}`}>
      <p className="text-muted-foreground text-xs">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </article>
  );
}
