import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  getMyCompanyProfile,
  updateMyCompanyProfile,
  type UpdateCompanyProfilePayload,
} from "@/shared/api/company";
import { ApiClientError } from "@/shared/api/http";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import {
  COMPANY_MANAGEMENT_QUERY_KEYS,
  COMPANY_PROFILE_COMPLETION_FIELDS,
  COMPANY_PROFILE_EMPTY_VALUES,
} from "./constants";
import {
  createCompanyProfileSchema,
  type CompanyProfileFormValues,
} from "./companyProfile.schema";
import type { CompanyProfile } from "./types";

function toFormValues(profile: CompanyProfile): CompanyProfileFormValues {
  return {
    name: profile.name,
    phone: profile.phone ?? COMPANY_PROFILE_EMPTY_VALUES.phone,
    email: profile.email ?? COMPANY_PROFILE_EMPTY_VALUES.email,
    businessRegisterAddress:
      profile.businessRegisterAddress ??
      COMPANY_PROFILE_EMPTY_VALUES.businessRegisterAddress,
    taxCode: profile.taxCode ?? COMPANY_PROFILE_EMPTY_VALUES.taxCode,
    headquartersAddress:
      profile.headquartersAddress ??
      COMPANY_PROFILE_EMPTY_VALUES.headquartersAddress,
    websiteLink:
      profile.websiteLink ?? COMPANY_PROFILE_EMPTY_VALUES.websiteLink,
    brand: profile.brand ?? COMPANY_PROFILE_EMPTY_VALUES.brand,
    companyCode:
      profile.companyCode ?? COMPANY_PROFILE_EMPTY_VALUES.companyCode,
    market: profile.market ?? COMPANY_PROFILE_EMPTY_VALUES.market,
  };
}

function normalizeNullableString(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function toUpdatePayload(
  values: CompanyProfileFormValues,
): UpdateCompanyProfilePayload {
  return {
    name: values.name.trim(),
    phone: normalizeNullableString(values.phone),
    email: normalizeNullableString(values.email),
    businessRegisterAddress: normalizeNullableString(
      values.businessRegisterAddress,
    ),
    taxCode: normalizeNullableString(values.taxCode),
    headquartersAddress: normalizeNullableString(values.headquartersAddress),
    websiteLink: normalizeNullableString(values.websiteLink),
    brand: normalizeNullableString(values.brand),
    companyCode: normalizeNullableString(values.companyCode),
    market: normalizeNullableString(values.market),
  };
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

export function useCompanyProfileForm() {
  const { t } = useI18n();
  const appToast = useAppToast();
  const queryClient = useQueryClient();
  const schema = useMemo(() => createCompanyProfileSchema(t), [t]);

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: COMPANY_PROFILE_EMPTY_VALUES,
  });

  const profileQuery = useQuery({
    queryKey: [COMPANY_MANAGEMENT_QUERY_KEYS.profile],
    queryFn: getMyCompanyProfile,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (profileQuery.data) {
      form.reset(toFormValues(profileQuery.data));
    }
  }, [form, profileQuery.data]);

  const saveProfileMutation = useMutation({
    mutationFn: (values: CompanyProfileFormValues) =>
      updateMyCompanyProfile(toUpdatePayload(values)),
    onSuccess: (nextProfile) => {
      queryClient.setQueryData(
        [COMPANY_MANAGEMENT_QUERY_KEYS.profile],
        nextProfile,
      );
      form.reset(toFormValues(nextProfile));
      appToast.success({
        title: t("company.profile.notice.saved.title"),
        description: t("company.profile.notice.saved.description"),
      });
    },
    onError: (error) => {
      appToast.error({
        title: t("company.profile.notice.error.title"),
        description: resolveErrorMessage(
          error,
          t("company.profile.error.unknown"),
        ),
      });
    },
  });

  const currentValues = useWatch({ control: form.control });

  const completionPercent = useMemo(() => {
    const total = COMPANY_PROFILE_COMPLETION_FIELDS.length;
    const completed = COMPANY_PROFILE_COMPLETION_FIELDS.filter((fieldName) => {
      const value = currentValues[fieldName];
      return String(value || "").trim().length > 0;
    }).length;

    return Math.round((completed / total) * 100);
  }, [currentValues]);

  const onSubmit = form.handleSubmit((values) => {
    saveProfileMutation.mutate(values);
  });

  const onReset = () => {
    if (profileQuery.data) {
      form.reset(toFormValues(profileQuery.data));
      return;
    }

    form.reset(COMPANY_PROFILE_EMPTY_VALUES);
  };

  const refreshProfile = async () => {
    const result = await profileQuery.refetch();

    if (result.error) {
      appToast.error({
        title: t("company.profile.notice.error.load"),
        description: resolveErrorMessage(
          result.error,
          t("company.profile.error.unknown"),
        ),
      });
      return;
    }

    if (result.data) {
      form.reset(toFormValues(result.data));
      appToast.info({
        title: t("company.profile.notice.refreshed.title"),
        description: t("company.profile.notice.refreshed.description"),
      });
    }
  };

  return {
    ...form,
    profile: profileQuery.data ?? null,
    profileQuery,
    completionPercent,
    isComplete: completionPercent === 100,
    isSaving: saveProfileMutation.isPending,
    onSubmit,
    onReset,
    refreshProfile,
  };
}

export type UseCompanyProfileFormResult = ReturnType<
  typeof useCompanyProfileForm
>;
