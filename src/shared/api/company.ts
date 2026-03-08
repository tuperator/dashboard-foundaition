import { API_ENDPOINTS } from "./endpoints";
import { apiClient } from "./http";

export type CompanyProfileResponse = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  businessRegisterAddress: string | null;
  taxCode: string | null;
  headquartersAddress: string | null;
  websiteLink: string | null;
  brand: string | null;
  companyCode: string | null;
  market: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type UpdateCompanyProfilePayload = {
  name: string;
  phone: string | null;
  email: string | null;
  businessRegisterAddress: string | null;
  taxCode: string | null;
  headquartersAddress: string | null;
  websiteLink: string | null;
  brand: string | null;
  companyCode: string | null;
  market: string | null;
};

export async function getMyCompanyProfile(): Promise<CompanyProfileResponse> {
  const response = await apiClient.get<CompanyProfileResponse>(API_ENDPOINTS.companies.me);
  return response.data;
}

export async function updateMyCompanyProfile(
  payload: UpdateCompanyProfilePayload,
): Promise<CompanyProfileResponse> {
  const response = await apiClient.put<CompanyProfileResponse>(
    API_ENDPOINTS.companies.me,
    payload,
  );

  return response.data;
}
