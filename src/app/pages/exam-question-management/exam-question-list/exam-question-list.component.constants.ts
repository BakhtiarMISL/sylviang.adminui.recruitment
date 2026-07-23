import { DifficultyLevelEnum, QuestionTypeEnum } from '@app/@core/enums/recruitment.enum';

export const ExamQuestionListColumns = [
  { field: 'questionText', label: 'Question', width: '24rem', sortable: true },
  { field: 'questionGroupName', label: 'Group', width: '12rem', sortable: false },
  { field: 'questionType', label: 'Type', width: '10rem', sortable: true },
  { field: 'difficultyLevel', label: 'Difficulty', width: '8rem', sortable: true },
  { field: 'marks', label: 'Marks', width: '6rem', sortable: true },
  { field: 'isActive', label: 'Status', width: '8rem', sortable: false },
];

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

export const ActiveStatusOptions = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
];
