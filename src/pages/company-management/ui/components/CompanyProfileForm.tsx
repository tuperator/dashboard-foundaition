import { HugeiconsIcon } from "@hugeicons/react";
import { FloppyDiskIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import type { UseCompanyProfileFormResult } from "../../model/useCompanyProfileForm";

type CompanyProfileFormProps = {
  form: UseCompanyProfileFormResult;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-destructive mt-1 text-[11px]">{message}</p>;
}

export function CompanyProfileForm({ form }: CompanyProfileFormProps) {
  const { t } = useI18n();
  const {
    register,
    onSubmit,
    onReset,
    isSaving,
    formState: { errors, isDirty, isValid },
  } = form;

  return (
    <form onSubmit={onSubmit} className="bg-card rounded-2xl border">
      <div className="border-b px-4 py-3 md:px-5">
        <h2 className="text-foreground text-sm font-semibold">
          {t("company.profile.form.title")}
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">
          {t("company.profile.form.description")}
        </p>
      </div>

      <div className="space-y-5 px-4 py-4 md:px-5">
        <section className="space-y-3">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t("company.profile.form.section.general")}
          </h3>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="company-name">
                {t("company.profile.form.name")}
              </Label>
              <Input
                id="company-name"
                placeholder={t("company.profile.form.placeholder.name")}
                className="mt-1"
                {...register("name")}
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div>
              <Label htmlFor="company-code">
                {t("company.profile.form.companyCode")}
              </Label>
              <Input
                id="company-code"
                placeholder={t("company.profile.form.placeholder.companyCode")}
                className="mt-1"
                {...register("companyCode")}
              />
            </div>

            <div>
              <Label htmlFor="company-brand">
                {t("company.profile.form.brand")}
              </Label>
              <Input
                id="company-brand"
                placeholder={t("company.profile.form.placeholder.brand")}
                className="mt-1"
                {...register("brand")}
              />
            </div>

            <div>
              <Label htmlFor="company-market">
                {t("company.profile.form.market")}
              </Label>
              <Input
                id="company-market"
                placeholder={t("company.profile.form.placeholder.market")}
                className="mt-1"
                {...register("market")}
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t("company.profile.form.section.contact")}
          </h3>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="company-email">
                {t("company.profile.form.email")}
              </Label>
              <Input
                id="company-email"
                type="email"
                placeholder={t("company.profile.form.placeholder.email")}
                className="mt-1"
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <Label htmlFor="company-phone">
                {t("company.profile.form.phone")}
              </Label>
              <Input
                id="company-phone"
                placeholder={t("company.profile.form.placeholder.phone")}
                className="mt-1"
                {...register("phone")}
              />
              <FieldError message={errors.phone?.message} />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="company-website">
                {t("company.profile.form.websiteLink")}
              </Label>
              <Input
                id="company-website"
                placeholder={t("company.profile.form.placeholder.website")}
                className="mt-1"
                {...register("websiteLink")}
              />
              <FieldError message={errors.websiteLink?.message} />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t("company.profile.form.section.legal")}
          </h3>

          <div className="space-y-3">
            <div>
              <Label htmlFor="company-tax-code">
                {t("company.profile.form.taxCode")}
              </Label>
              <Input
                id="company-tax-code"
                placeholder={t("company.profile.form.placeholder.taxCode")}
                className="mt-1"
                {...register("taxCode")}
              />
            </div>

            <div>
              <Label htmlFor="company-headquarters">
                {t("company.profile.form.headquartersAddress")}
              </Label>
              <Textarea
                id="company-headquarters"
                placeholder={t(
                  "company.profile.form.placeholder.headquartersAddress",
                )}
                className="mt-1 min-h-[74px]"
                {...register("headquartersAddress")}
              />
            </div>

            <div>
              <Label htmlFor="company-register-address">
                {t("company.profile.form.businessRegisterAddress")}
              </Label>
              <Textarea
                id="company-register-address"
                placeholder={t(
                  "company.profile.form.placeholder.businessRegisterAddress",
                )}
                className="mt-1 min-h-[74px]"
                {...register("businessRegisterAddress")}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="border-t px-4 py-3 md:px-5">
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={!isDirty || isSaving}
          >
            {t("company.profile.action.reset")}
          </Button>
          <Button type="submit" disabled={!isValid || !isDirty || isSaving}>
            <HugeiconsIcon icon={FloppyDiskIcon} />
            {isSaving
              ? t("company.profile.action.saving")
              : t("company.profile.action.save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
