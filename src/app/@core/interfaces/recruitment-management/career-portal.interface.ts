import { CircularTypeEnum, EducationLevelEnum, EmploymentTypeEnum } from '@app/@core/enums/recruitment.enum';

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
}

export interface IJobApplicationSubmitRequest {
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  coverLetter?: string;
}

export interface IJobApplicationSubmitResponse {
  jobApplicationId: number;
  jobPostingId: number;
  candidateName: string;
  applicationStatus: string;
  appliedDate?: string;
  source: string;
}
