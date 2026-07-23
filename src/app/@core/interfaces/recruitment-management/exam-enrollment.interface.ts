import { NotificationStatusEnum } from '@app/@core/enums/recruitment.enum';

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
}

export interface IExamEnrollmentReassignSeatRequest {
  examRoomId: number;
  seatNumber: string;
}
