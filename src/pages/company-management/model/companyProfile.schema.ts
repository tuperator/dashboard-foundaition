import { z } from "zod";
import type { Translate } from "@/shared/providers/i18n/I18nProvider";

const PHONE_REGEX = /^[0-9+().\-\s]{8,15}$/;

export function createCompanyProfileSchema(t: Translate) {
  const emailSchema = z.email(t("company.profile.validation.emailInvalid"));
  const urlSchema = z.url(t("company.profile.validation.websiteInvalid"));

  return z.object({
    name: z.string().trim().min(1, t("company.profile.validation.nameRequired")),
    companyCode: z.string().trim().max(255),
    brand: z.string().trim().max(255),
    market: z.string().trim().max(255),
    email: z
      .string()
      .trim()
      .max(255)
      .refine((value) => value.length === 0 || emailSchema.safeParse(value).success, {
        message: t("company.profile.validation.emailInvalid"),
      }),
    phone: z
      .string()
      .trim()
      .max(15)
      .refine((value) => value.length === 0 || PHONE_REGEX.test(value), {
        message: t("company.profile.validation.phoneInvalid"),
      }),
    websiteLink: z
      .string()
      .trim()
      .max(512)
      .refine((value) => value.length === 0 || urlSchema.safeParse(value).success, {
        message: t("company.profile.validation.websiteInvalid"),
      }),
    taxCode: z.string().trim().max(255),
    headquartersAddress: z.string().trim().max(1000),
    businessRegisterAddress: z.string().trim().max(1000),
  });
}

export type CompanyProfileSchema = ReturnType<typeof createCompanyProfileSchema>;
export type CompanyProfileFormValues = z.infer<CompanyProfileSchema>;
