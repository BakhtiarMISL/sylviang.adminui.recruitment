import { ApplicationSourceEnum, ApplicationStatusEnum, EducationLevelEnum } from '@app/@core/enums/recruitment.enum';

/**
 * ATS dashboard filter query params (US-035 scalar filters + US-050 candidate-attribute filters).
 * minEducationLevel/minExperienceYears/maxExperienceYears/skills/location/minAge/maxAge require
 * jobPostingId to be set (enforced server-side).
 */
export interface IAtsDashboardFilterParams {
  jobPostingId?: number;
  status?: ApplicationStatusEnum;
  source?: ApplicationSourceEnum;
  dateFrom?: string;
  dateTo?: string;
  minEducationLevel?: EducationLevelEnum;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  skills?: string[];
  location?: string;
  minAge?: number;
  maxAge?: number;
  tags?: string[];

  /** EP-14 US-109 AC2: only rows currently flagged stale (days in current stage over threshold). */
  staleOnly?: boolean;
}

export interface IJobApplicationListItem {
  jobApplicationId: number;
  candidateName: string;
  jobPostingId: number;
  jobPostingTitle?: string;
  source: ApplicationSourceEnum;
  appliedDate?: string;
  applicationStatus: ApplicationStatusEnum;

  // EP-14 US-109 AC1/AC2: tracker columns, populated from the application's current pipeline
  // stage - absent/null for applications that haven't entered a stage yet.
  currentStageName?: string;
  lastUpdatedAt?: string;
  daysInCurrentStage?: number;
  isStale?: boolean;
  assignedHrUserName?: string;
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
  specialCategoryName?: string;
  waiverProofDocumentUrl?: string;
  waiverRuleName?: string;
  waivedAt?: string;
  statusHistory: IApplicationStatusHistoryEntry[];
}

// ── Duplicate Detection (US-038) ──────────────────────────────────────────

export interface IJobApplicationDuplicateItem {
  jobApplicationId: number;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidateNationalId?: string;
  source: ApplicationSourceEnum;
  applicationStatus: ApplicationStatusEnum;
  appliedDate?: string;
  resumeUrl?: string;
}

export interface IJobApplicationDuplicateGroup {
  applications: IJobApplicationDuplicateItem[];
  matchedOn: string[];
}

export interface IJobApplicationDuplicateResolveRequest {
  jobPostingId: number;
  primaryJobApplicationId: number;
  duplicateJobApplicationIds: number[];
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

/** EP-09 US-076: re-send a chosen event's notification across a batch of applications. */
export interface IJobApplicationBulkNotifyRequest {
  jobApplicationIds: number[];
  recruitmentEvent: string;
}

export interface IJobApplicationBulkNotifyFailure {
  jobApplicationId: number;
  reason: string;
}

export interface IJobApplicationBulkNotifyResponse {
  succeededIds: number[];
  failed: IJobApplicationBulkNotifyFailure[];
}

export interface IMyApplicationInterview {
  interviewId: number;
  scheduledDate?: string;
  location?: string;
  meetingLink?: string;
  round?: string;
}

export interface IMyApplication {
  jobApplicationId: number;
  jobPostingId: number;
  jobPostingTitle?: string;
  appliedDate?: string;
  applicationStatus: ApplicationStatusEnum;
  canWithdraw: boolean;
  interviews: IMyApplicationInterview[];
}
