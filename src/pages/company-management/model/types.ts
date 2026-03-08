export type CompanyProfile = {
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

export type CompanyProfileFormValues = {
  name: string;
  phone: string;
  email: string;
  businessRegisterAddress: string;
  taxCode: string;
  headquartersAddress: string;
  websiteLink: string;
  brand: string;
  companyCode: string;
  market: string;
};
