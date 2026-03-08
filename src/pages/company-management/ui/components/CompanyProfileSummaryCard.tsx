import type { ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CreditCardIcon,
  LayoutIcon,
  MailIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import type { CompanyProfile } from "../../model/types";

type CompanyProfileSummaryCardProps = {
  profile: CompanyProfile;
};

function formatDate(value: string | null, locale: "vi" | "en") {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ProfileMetaItem({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-2 rounded-lg border bg-muted/15 px-2.5 py-2">
      <HugeiconsIcon icon={icon} className="text-muted-foreground size-3.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-xs font-medium text-foreground">{value}</p>
      </div>
    </li>
  );
}

export function CompanyProfileSummaryCard({ profile }: CompanyProfileSummaryCardProps) {
  const { t, locale } = useI18n();
  const updatedAt = formatDate(profile.updatedAt, locale);
  const createdAt = formatDate(profile.createdAt, locale) ?? "-";

  return (
    <Card className="rounded-2xl border bg-card">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center gap-3">
          <div className="from-primary/85 to-primary/65 text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-semibold">
            {(profile.brand || profile.name).trim().charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-sm font-semibold text-foreground">
              {profile.name}
            </CardTitle>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {profile.email || t("company.profile.summary.emptyValue")}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-3">
        <ul className="space-y-2">
          <ProfileMetaItem
            icon={LayoutIcon}
            label={t("company.profile.form.companyCode")}
            value={profile.companyCode || t("company.profile.summary.emptyValue")}
          />
          <ProfileMetaItem
            icon={CreditCardIcon}
            label={t("company.profile.form.taxCode")}
            value={profile.taxCode || t("company.profile.summary.emptyValue")}
          />
          <ProfileMetaItem
            icon={UserIcon}
            label={t("company.profile.form.phone")}
            value={profile.phone || t("company.profile.summary.emptyValue")}
          />
          <ProfileMetaItem
            icon={MailIcon}
            label={t("company.profile.form.websiteLink")}
            value={profile.websiteLink || t("company.profile.summary.emptyValue")}
          />
        </ul>

        <div className="space-y-2 rounded-xl border bg-muted/15 p-3">
          <div className="text-[11px] text-muted-foreground">
            {t("company.profile.summary.createdAt")}
          </div>
          <div className="text-xs font-medium text-foreground">{createdAt}</div>
          <div className="text-[11px] text-muted-foreground">
            {t("company.profile.summary.updatedAt")}
          </div>
          <div className="text-xs font-medium text-foreground">
            {updatedAt || t("company.profile.summary.notUpdated")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
