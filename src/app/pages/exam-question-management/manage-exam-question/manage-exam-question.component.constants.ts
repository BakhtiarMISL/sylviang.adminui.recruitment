import { DifficultyLevelEnum, QuestionTypeEnum } from '@app/@core/enums/recruitment.enum';
import { IExamQuestionOption } from '@app/@core/interfaces/recruitment-management/exam-question.interface';

export const QuestionTypeOptions = [
  { label: 'MCQ (Single Correct)', value: QuestionTypeEnum.McqSingle },
  { label: 'MCQ (Multiple Correct)', value: QuestionTypeEnum.McqMultiple },
  { label: 'True/False', value: QuestionTypeEnum.TrueFalse },
  { label: 'Subjective', value: QuestionTypeEnum.Subjective },
];

export const DifficultyLevelOptions = [
  { label: 'Easy', value: DifficultyLevelEnum.Easy },
  { label: 'Medium', value: DifficultyLevelEnum.Medium },
  { label: 'Hard', value: DifficultyLevelEnum.Hard },
];

/**
 * Seeds the options array to match what QuestionType requires, mirroring newCriterion()'s role
 * in manage-shortlist-filter: True/False gets two locked rows (text is fixed, only correctness
 * is editable), MCQ gets two blank editable rows to start from, Subjective gets none.
 */
export function newQuestionOptionsForType(questionType: QuestionTypeEnum): IExamQuestionOption[] {
  switch (questionType) {
    case QuestionTypeEnum.TrueFalse:
      return [
        { optionText: 'True', isCorrect: false, displayOrder: 0 },
        { optionText: 'False', isCorrect: false, displayOrder: 1 },
      ];
    case QuestionTypeEnum.McqSingle:
    case QuestionTypeEnum.McqMultiple:
      return [
        { optionText: '', isCorrect: false, displayOrder: 0 },
        { optionText: '', isCorrect: false, displayOrder: 1 },
      ];
    case QuestionTypeEnum.Subjective:
    default:
      return [];
  }
}

export function newOption(displayOrder: number): IExamQuestionOption {
  return { optionText: '', isCorrect: false, displayOrder };
}
