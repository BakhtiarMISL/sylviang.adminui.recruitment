import { ExamAttemptStatusEnum, ExamTypeEnum, QuestionTypeEnum } from '@app/@core/enums/recruitment.enum';

/** One row of the current candidate's own exam enrollments (US-058 AC1), shown in My Applications. */
export interface IMyExamEnrollmentResponse {
  examEnrollmentId: number;
  jobApplicationId: number;
  jobPostingId: number;
  jobPostingTitle: string;

  examId: number;
  examTitle: string;
  examType: ExamTypeEnum;
  scheduledStartAt: string;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;

  attemptStatus: ExamAttemptStatusEnum;
  score?: number | null;
  isPassed?: boolean | null;
  resultsVisible: boolean;
}

export interface IExamPaperOptionResponse {
  examQuestionOptionId: number;
  optionText: string;
}

export interface IExamPaperQuestionResponse {
  examQuestionId: number;
  questionText: string;
  questionType: QuestionTypeEnum;
  marks: number;
  options: IExamPaperOptionResponse[];
}

export interface IExamPaperResponse {
  examEnrollmentId: number;
  examTitle: string;
  durationMinutes: number;
  startedAt: string;
  deadlineAt: string;
  questions: IExamPaperQuestionResponse[];
}

export interface IExamAnswerRequest {
  examQuestionId: number;
  selectedOptionIds?: number[];
  answerText?: string;
}

export interface IExamSubmitRequest {
  answers: IExamAnswerRequest[];
}

export interface IExamSubmitResultResponse {
  referenceNumber: string;
  submittedAt: string;
  resultsVisible: boolean;
  score?: number | null;
  isPassed?: boolean | null;
}
