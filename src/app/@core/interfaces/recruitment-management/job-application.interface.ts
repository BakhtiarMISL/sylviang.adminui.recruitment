import { ApplicationSourceEnum, ApplicationStatusEnum } from '@app/@core/enums/recruitment.enum';

export interface IJobApplicationListItem {
  jobApplicationId: number;
  candidateName: string;
  jobPostingId: number;
  jobPostingTitle?: string;
  source: ApplicationSourceEnum;
  appliedDate?: string;
  applicationStatus: ApplicationStatusEnum;
}

export interface IApplicationStatusHistoryEntry {
  applicationStatusHistoryId: number;
  fromStatus?: ApplicationStatusEnum;
  toStatus: ApplicationStatusEnum;
  changedByUserName?: string;
  changedAt: string;
  reasonId?: number;
  reasonLabel?: string;
  note?: string;
}

export interface IJobApplicationDetail {
  jobApplicationId: number;
  jobPostingId: number;
  jobPostingTitle?: string;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  applicationStatus: ApplicationStatusEnum;
  appliedDate?: string;
  source: ApplicationSourceEnum;
  statusHistory: IApplicationStatusHistoryEntry[];
}

export interface IApplicationStatusReason {
  applicationStatusReasonId: number;
  label: string;
  appliesToStatus: ApplicationStatusEnum;
  displayOrder: number;
}

export interface IJobApplicationStatusUpdateRequest {
  toStatus: ApplicationStatusEnum;
  reasonId?: number;
  note?: string;
}

export interface IJobApplicationBulkStatusUpdateRequest {
  jobApplicationIds: number[];
  toStatus: ApplicationStatusEnum;
  reasonId?: number;
  note?: string;
}

export interface IJobApplicationBulkStatusUpdateFailure {
  jobApplicationId: number;
  reason: string;
}

export interface IJobApplicationBulkStatusUpdateResponse {
  succeededIds: number[];
  failed: IJobApplicationBulkStatusUpdateFailure[];
}
