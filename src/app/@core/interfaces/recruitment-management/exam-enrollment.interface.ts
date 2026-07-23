import { NotificationStatusEnum, ScoreSourceEnum } from '@app/@core/enums/recruitment.enum';

export interface IExamEnrollmentResponse {
  examEnrollmentId: number;
  examId: number;
  jobApplicationId: number;
  candidateName: string;
  candidateEmail?: string | null;
  candidatePhone?: string | null;

  examRoomId?: number | null;
  examRoomName?: string | null;
  seatNumber?: string | null;

  enrolledAt: string;

  emailNotificationStatus: NotificationStatusEnum;
  emailSentAt?: string | null;
  emailFailureReason?: string | null;

  smsNotificationStatus: NotificationStatusEnum;
  smsLoggedAt?: string | null;

  startedAt?: string | null;
  submittedAt?: string | null;
  attemptStatus: string;

  score?: number | null;
  isPassed?: boolean | null;
  scoreSource?: ScoreSourceEnum | null;
  scoredAt?: string | null;
  scoredByUserName?: string | null;
}

export interface IExamEnrollmentReassignSeatRequest {
  examRoomId: number;
  seatNumber: string;
}

export interface IExamScoreUploadRequest {
  score: number;
}

export interface IExamScoreBulkUploadRowError {
  rowNumber: number;
  message: string;
}

export interface IExamScoreBulkUploadResponse {
  totalRows: number;
  updatedCount: number;
  failedCount: number;
  errors: IExamScoreBulkUploadRowError[];
}
