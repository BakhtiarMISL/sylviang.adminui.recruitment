import { CircularTypeEnum, EducationLevelEnum, EmploymentTypeEnum, JobStatusEnum } from '@app/@core/enums/recruitment.enum';

export interface IJobVacancyCreateRequest {
  siteId: number;
  departmentId?: number;
  designationId?: number;
  title: string;
  description?: string;
  requirements?: string;
  numberOfPositions: number;
  employmentType: EmploymentTypeEnum;
  location?: string;
  circularType: CircularTypeEnum;
  minSalary?: number;
  maxSalary?: number;
  postingDate?: string;
  closingDate?: string;
  minAge?: number;
  maxAge?: number;
  minEducationLevel?: EducationLevelEnum;
  minExperienceYears?: number;
  requiredDistrict?: string;
  applicationFeeAmount?: number;
  applicationFeeCurrency?: string;
}

export interface IJobVacancyResponse extends IJobVacancyCreateRequest {
  jobPostingId: number;
  jobPostingCode: string;
  status: JobStatusEnum;
  siteName?: string;
  departmentName?: string;
  designationName?: string;
  totalApplications: number;
  isActive: boolean;
}

export interface IJobVacancyUpdateRequest extends IJobVacancyCreateRequest {
  jobPostingId: number;
  status: JobStatusEnum;
}
