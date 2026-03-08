import { ApiClientError } from "@/shared/api/http";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { AppShell } from "@/widgets/app-shell";
import { useCompanyProfileForm } from "../model/useCompanyProfileForm";
import { CompanyManagementHeader } from "./components/CompanyManagementHeader";
import { CompanyProfileForm } from "./components/CompanyProfileForm";
import { CompanyProfileSummaryCard } from "./components/CompanyProfileSummaryCard";

export function CompanyManagementPage() {
  const { t } = useI18n();
  const form = useCompanyProfileForm();
  const { profile, profileQuery, completionPercent, isComplete, refreshProfile } = form;

  return (
    <AppShell>
      <section className="space-y-4">
        <CompanyManagementHeader
          companyName={profile?.name || t("company.profile.summary.emptyValue")}
          completionPercent={completionPercent}
          isComplete={isComplete}
          loading={profileQuery.isFetching}
          onRefresh={() => {
            void refreshProfile();
          }}
        />

        {profileQuery.isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <p className="text-sm font-medium text-destructive">
              {t("company.profile.notice.error.load")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {resolveErrorMessage(profileQuery.error, t("company.profile.error.unknown"))}
            </p>
          </div>
        ) : null}

        {profile ? (
          <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <CompanyProfileSummaryCard profile={profile} />
            <CompanyProfileForm form={form} />
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            {profileQuery.isLoading
              ? t("company.profile.state.loading")
              : t("company.profile.state.empty")}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function resolveErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
