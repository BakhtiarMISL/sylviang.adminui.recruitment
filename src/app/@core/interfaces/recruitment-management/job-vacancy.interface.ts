import { CircularTypeEnum, EducationLevelEnum, EmploymentTypeEnum, JobStatusEnum } from '@app/@core/enums/recruitment.enum';

export interface IJobVacancyCreateRequest {
  departmentId?: number;
  title: string;
  description?: string;
  requirements?: string;
  numberOfPositions: number;
  employmentType: EmploymentTypeEnum;
  location?: string;
  circularType: CircularTypeEnum;
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
  postingDate?: string;
  closingDate?: string;
  minAge?: number;
  maxAge?: number;
  minEducationLevel?: EducationLevelEnum;
  minExperienceYears?: number;
  requiredDistrict?: string;
  applicationFeeAmount?: number;
  applicationFeeCurrency?: string;
  hiringPipelineId: number;
}

export interface IJobVacancyResponse extends IJobVacancyCreateRequest {
  jobPostingId: number;
  jobPostingCode: string;
  status: JobStatusEnum;
  departmentName?: string;
  totalApplications: number;
  isActive: boolean;
  hiringPipelineName?: string;
}

export interface IJobVacancyUpdateRequest extends IJobVacancyCreateRequest {
  jobPostingId: number;
  status: JobStatusEnum;
}
