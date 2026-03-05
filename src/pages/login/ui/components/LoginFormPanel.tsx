import { Controller } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import type { UseLoginFormResult } from "../../model/useLoginForm";

type LoginFormPanelProps = {
  form: UseLoginFormResult;
};

export function LoginFormPanel({ form }: LoginFormPanelProps) {
  const { t } = useI18n();
  const {
    register,
    control,
    onSubmit,
    showPassword,
    togglePasswordVisibility,
    isSubmitting,
    submitError,
    formState: { errors, isValid },
  } = form;

  return (
    <section className="flex min-h-[580px] flex-col p-5 md:p-8">
      <div className="mb-5 flex items-center gap-2">
        <span className="bg-primary text-primary-foreground inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold">
          T
        </span>
        <span className="text-foreground text-lg font-semibold tracking-[-0.01em] md:text-xl">
          {t("auth.login.brand")}
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center">
        <div className="mb-6 text-center">
          <h1 className="text-foreground text-[36px] leading-tight font-semibold tracking-[-0.03em] md:text-[40px]">
            {t("auth.login.welcomeBack")}
          </h1>
          <p className="text-muted-foreground mt-2 text-[13px] md:text-sm">
            {t("auth.login.subtitle")}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="identity">{t("auth.login.email")}</Label>
            <Input
              id="identity"
              autoComplete="email"
              placeholder={t("auth.login.emailPlaceholder")}
              className="h-10 rounded-xl px-3 text-sm"
              {...register("identity")}
            />
            {errors.identity ? (
              <p className="text-destructive text-xs">{errors.identity.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t("auth.login.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={t("auth.login.passwordPlaceholder")}
                className="h-10 rounded-xl px-3 pr-14 text-sm"
                {...register("password")}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs transition"
              >
                {showPassword
                  ? t("auth.login.hidePassword")
                  : t("auth.login.showPassword")}
              </button>
            </div>
            {errors.password ? (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <Controller
              control={control}
              name="rememberMe"
              render={({ field }) => (
                <label className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  />
                  {t("auth.login.rememberMe")}
                </label>
              )}
            />

            <Label>{t("auth.login.forgotPassword")}</Label>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!isValid || isSubmitting}
            className="h-10 w-full rounded-xl text-sm font-medium"
          >
            {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>

          {submitError ? (
            <p className="text-destructive text-xs">{submitError}</p>
          ) : null}

          <Button
            type="button"
            variant="outline"
            disabled
            className="h-10 w-full rounded-xl text-sm"
          >
            {t("auth.login.sso")}
            <span className="text-muted-foreground ml-1 text-[10px]">
              {t("common.comingSoon")}
            </span>
          </Button>
        </form>

        <p className="text-muted-foreground mt-4 text-center text-sm">
          {t("auth.login.contactAdmin")}
        </p>
      </div>

      <div className="text-muted-foreground mt-6 flex items-center justify-between text-xs">
        <span>{t("auth.login.copyright")}</span>
        <button type="button" className="hover:text-foreground transition">
          {t("auth.login.privacyPolicy")}
        </button>
      </div>
    </section>
  );
}
