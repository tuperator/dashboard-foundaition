import { z } from "zod";
import type { Translate } from "@/shared/providers/i18n/I18nProvider";

export function createLoginSchema(t: Translate) {
  return z.object({
    identity: z
      .string()
      .trim()
      .min(1, t("auth.validation.emailRequired"))
      .pipe(z.email(t("auth.validation.emailInvalid"))),
    password: z
      .string()
      .min(1, t("auth.validation.passwordRequired"))
      .min(6, t("auth.validation.passwordMin")),
    rememberMe: z.boolean(),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
