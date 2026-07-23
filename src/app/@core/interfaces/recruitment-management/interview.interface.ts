import { InterviewResultEnum, InterviewStatusEnum, InterviewTypeEnum, NotificationStatusEnum } from '@core/enums/recruitment.enum';

export interface IInterviewScheduleRequest {
  jobApplicationId: number;
  pipelineStageId?: number | null;
  interviewType: InterviewTypeEnum;
  interviewVenueId?: number | null;
  interviewRoomId?: number | null;
  meetingLink?: string | null;
  scheduledStartAt: string;
  scheduledEndAt: string;
  round: number;
  interviewRoundConfigId?: number | null;
  panelistEmployeeIds: number[];
  notes?: string | null;
}

export interface IInterviewBulkScheduleRequest {
  jobApplicationIds: number[];
  pipelineStageId?: number | null;
  interviewType: InterviewTypeEnum;
  interviewVenueId?: number | null;
  interviewRoomId?: number | null;
  meetingLink?: string | null;
  startAt: string;
  durationMinutes: number;
  gapMinutes: number;
  round: number;
  interviewRoundConfigId?: number | null;
  panelistEmployeeIds: number[];
  notes?: string | null;
}

export interface IInterviewRescheduleRequest {
  scheduledStartAt: string;
  scheduledEndAt: string;
  interviewVenueId?: number | null;
  interviewRoomId?: number | null;
  meetingLink?: string | null;
}

export interface IInterviewBulkRescheduleRequest {
  interviewIds: number[];
  startAt: string;
  gapMinutes: number;
}

export interface IInterviewCancelRequest {
  cancellationReason: string;
}

export interface IInterviewBulkCancelRequest {
  interviewIds: number[];
  cancellationReason: string;
}

export interface IInterviewMarkResultRequest {
  result: InterviewResultEnum;
}

export interface IInterviewResponse {
  interviewId: number;
  jobApplicationId: number;
  candidateName: string;
  jobPostingId: number;
  pipelineStageId?: number | null;
  interviewType: InterviewTypeEnum;
  interviewVenueId?: number | null;
  venueName?: string | null;
  interviewRoomId?: number | null;
  roomName?: string | null;
  meetingLink?: string | null;
  scheduledStartAt: string;
  scheduledEndAt: string;
  round: number;
  interviewRoundConfigId?: number | null;
  roundConfigName?: string | null;
  result: InterviewResultEnum;
  status: InterviewStatusEnum;
  cancellationReason?: string | null;
  panelistEmployeeIds: number[];
  emailNotificationStatus: NotificationStatusEnum;
  emailFailureReason?: string | null;
  smsNotificationStatus: NotificationStatusEnum;
  notes?: string | null;
}
