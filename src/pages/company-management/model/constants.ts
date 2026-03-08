import type { CompanyProfile, CompanyProfileFormValues } from "./types";

export const COMPANY_MANAGEMENT_QUERY_KEYS = {
  profile: "company-management-profile",
} as const;

export const COMPANY_PROFILE_COMPLETION_FIELDS = [
  "name",
  "companyCode",
  "brand",
  "market",
  "email",
  "phone",
  "websiteLink",
  "taxCode",
  "headquartersAddress",
  "businessRegisterAddress",
] as const;

export const COMPANY_PROFILE_EMPTY_VALUES: CompanyProfileFormValues = {
  name: "",
  phone: "",
  email: "",
  businessRegisterAddress: "",
  taxCode: "",
  headquartersAddress: "",
  websiteLink: "",
  brand: "",
  companyCode: "",
  market: "",
};

export const COMPANY_PROFILE_EMPTY: CompanyProfile = {
  id: "",
  name: "",
  phone: null,
  email: null,
  businessRegisterAddress: null,
  taxCode: null,
  headquartersAddress: null,
  websiteLink: null,
  brand: null,
  companyCode: null,
  market: null,
  createdAt: "",
  updatedAt: null,
};
