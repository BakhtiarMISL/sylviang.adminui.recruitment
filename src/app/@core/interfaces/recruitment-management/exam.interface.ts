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
  questionGroupIds?: number[] | null;
  showResultsToCandidate: boolean;
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
  questionGroupIds: number[];
  questionGroupNames: string[];
  seatPlanGeneratedAt?: string | null;
  isActive: boolean;
  showResultsToCandidate: boolean;
}
