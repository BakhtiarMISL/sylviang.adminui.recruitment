import { CircularTypeEnum, EducationLevelEnum, EmploymentTypeEnum } from '@app/@core/enums/recruitment.enum';
import { IJobVacancyAttachmentResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy-attachment.interface';

export interface IPublicJobPostingResponse {
  jobPostingId: number;
  jobPostingCode: string;
  title: string;
  description?: string;
  requirements?: string;
  departmentId?: number;
  designationId?: number;
  location?: string;
  employmentType: EmploymentTypeEnum;
  circularType: CircularTypeEnum;
  closingDate?: string;
  postingDate?: string;
  minAge?: number;
  maxAge?: number;
  minEducationLevel?: EducationLevelEnum;
  minExperienceYears?: number;
  requiredDistrict?: string;
  applicationFeeAmount?: number;
  applicationFeeCurrency?: string;
  attachments?: IJobVacancyAttachmentResponse[];
}

export interface IJobApplicationSubmitRequest {
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  coverLetter?: string;
  // EP-17/US-127: optional, feeds fee-waiver rule matching and F1 reconciliation reporting.
  specialCategoryId?: number | null;
  referralSourceId?: number | null;
}

export interface IJobApplicationSubmitResponse {
  jobApplicationId: number;
  jobPostingId: number;
  candidateName: string;
  applicationStatus: string;
  appliedDate?: string;
  source: string;
  // EP-17: set when the vacancy has an application fee configured. paymentRedirectUrl is null
  // if the gateway couldn't be reached at submit time even though payment is required.
  paymentRequired?: boolean;
  paymentRedirectUrl?: string;
}

export interface IJobEligibilityResponse {
  isEligible: boolean;
  unmetRequirements: string[];
}
