import { DifficultyLevelEnum, QuestionTypeEnum } from '@app/@core/enums/recruitment.enum';

export interface IExamQuestionOption {
  examQuestionOptionId?: number;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface IExamQuestionCreateRequest {
  questionGroupId: number;
  questionText: string;
  questionType: QuestionTypeEnum;
  difficultyLevel: DifficultyLevelEnum;
  marks: number;
  explanation?: string;
  modelAnswer?: string;
  options: IExamQuestionOption[];
}

export interface IExamQuestionUpdateRequest extends IExamQuestionCreateRequest {}

export interface IExamQuestionResponse {
  examQuestionId: number;
  questionGroupId: number;
  questionGroupName: string;
  questionText: string;
  questionType: QuestionTypeEnum;
  difficultyLevel: DifficultyLevelEnum;
  marks: number;
  explanation?: string;
  modelAnswer?: string;
  isActive: boolean;
  options: IExamQuestionOption[];
}

export interface IExamQuestionBulkImportRowError {
  rowNumber: number;
  message: string;
}

export interface IExamQuestionBulkImportResponse {
  totalRows: number;
  importedCount: number;
  failedCount: number;
  errors: IExamQuestionBulkImportRowError[];
}
