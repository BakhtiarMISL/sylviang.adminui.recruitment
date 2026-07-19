import { StageTypeEnum } from '@core/enums/recruitment.enum';
import { IAssessmentStage } from '@app/@core/interfaces/recruitment-management/assessment-workflow.interface';

export const StageTypeLabels: Record<StageTypeEnum, string> = {
  [StageTypeEnum.WrittenTest]: 'Written Test',
  [StageTypeEnum.AptitudeTest]: 'Aptitude Test',
  [StageTypeEnum.PsychometricTest]: 'Psychometric Test',
  [StageTypeEnum.GroupDiscussion]: 'Group Discussion',
  [StageTypeEnum.PracticalAssessment]: 'Practical Assessment',
};

export const StageTypeOptions = Object.values(StageTypeEnum).map((value) => ({
  label: StageTypeLabels[value],
  value,
}));

export function newStage(displayOrder: number): IAssessmentStage {
  return {
    stageType: StageTypeEnum.WrittenTest,
    maxMarks: 100,
    passMarks: 40,
    durationMinutes: 60,
    displayOrder,
    isMandatory: true,
  };
}
