export enum CompanyStatusEnum {
  Active = 'Active',
  Inactive = 'Inactive',
}

export interface ICompanyResponse {
  companyId: number;
  name: string;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  industry: string | null;
  tradeLicenseNumber: string | null;
  binNumber: string | null;
  status: CompanyStatusEnum;
  createdAt: string | null;
  jobPostingCount: number;
  userAccountCount: number;
}

export interface ICompanyCreateRequest {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  industry?: string | null;
  tradeLicenseNumber?: string | null;
  binNumber?: string | null;
}

export interface ICompanyUpdateRequest extends ICompanyCreateRequest {}
