import { ExamTypeEnum } from '@app/@core/enums/recruitment.enum';

export interface IExamCreateRequest {
  jobPostingId: number;
  title: string;
  scheduledStartAt: string;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  examType: ExamTypeEnum;
  examVenueId?: number | null;
  questionGroupId?: number | null;
}

export interface IExamResponse {
  examId: number;
  jobPostingId: number;
  title: string;
  scheduledStartAt: string;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  examType: ExamTypeEnum;
  examVenueId?: number | null;
  examVenueName?: string | null;
  questionGroupId?: number | null;
  questionGroupName?: string | null;
  seatPlanGeneratedAt?: string | null;
  isActive: boolean;
}
