import { ApplicationStatusEnum } from '@app/@core/enums/recruitment.enum';

export interface IRecruitmentFunnelRequest {
  jobPostingId?: number | null;
  departmentId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  isInternal?: boolean | null;
}

export interface IFunnelDropOffReasonResponse {
  reasonLabel: string;
  count: number;
}

export interface IFunnelStageResponse {
  status: ApplicationStatusEnum;
  label: string;
  count: number;
  conversionFromPreviousPercent: number | null;
  passedCount: number;
  droppedCount: number;
  dropOffReasons: IFunnelDropOffReasonResponse[];
}

export interface IRecruitmentFunnelResponse {
  stages: IFunnelStageResponse[];
}

export interface ITimeToHireRequest {
  jobPostingId?: number | null;
  departmentId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface IStageDurationResponse {
  toStatus: ApplicationStatusEnum;
  averageDays: number;
  sampleSize: number;
}

export interface ITimeToHireResponse {
  averageDays: number | null;
  minDays: number | null;
  maxDays: number | null;
  vacancyCount: number;
  stageBreakdown: IStageDurationResponse[];
}
