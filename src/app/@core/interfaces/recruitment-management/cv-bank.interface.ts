import { ApplicationSourceEnum, EducationLevelEnum } from '@app/@core/enums/recruitment.enum';

export interface ICvBankSearchRequest {
  booleanQuery?: string;
  educationLevel?: EducationLevelEnum;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  location?: string;
  candidateType?: ApplicationSourceEnum;
  page: number;
  pageSize: number;
}

export interface ICvBankSearchResultResponse {
  candidateProfileId: number;
  fullName: string;
  email: string;
  phone?: string;
  phoneDialCode?: string;
  profilePhotoPath?: string;
  educationSummary?: string;
  totalExperienceYears: number;
  relevanceScore: number;
}

export interface ICvBankTalentPoolAddRequest {
  candidateProfileIds: number[];
}

export interface ICvBankTalentPoolAddResponse {
  addedCount: number;
  alreadyInPoolCount: number;
}

export interface ICvBankCvBulkRequest {
  candidateProfileIds: number[];
}

export interface ICvBankTalentPoolEntryResponse {
  candidateProfileId: number;
  fullName: string;
  email: string;
  phone?: string;
  phoneDialCode?: string;
  profilePhotoPath?: string;
  addedAt?: string;
}
