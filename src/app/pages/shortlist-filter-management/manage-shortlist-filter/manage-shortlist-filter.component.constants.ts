import { CriterionTypeEnum } from '@app/@core/enums/recruitment.enum';
import { IShortlistFilterCriterion } from '@app/@core/interfaces/recruitment-management/shortlist-filter.interface';

export const CriterionTypeOptions: { label: string; value: CriterionTypeEnum }[] = [
  { label: 'Education Level', value: CriterionTypeEnum.EducationLevel },
  { label: 'Minimum Experience Years', value: CriterionTypeEnum.MinExperienceYears },
  { label: 'Required Skills', value: CriterionTypeEnum.RequiredSkills },
  { label: 'Age Range', value: CriterionTypeEnum.AgeRange },
  { label: 'Location / District', value: CriterionTypeEnum.District },
  { label: 'Minimum Screening Score', value: CriterionTypeEnum.MinScreeningScore },
];

export function newCriterion(displayOrder: number, criterionType: CriterionTypeEnum = CriterionTypeEnum.MinExperienceYears): IShortlistFilterCriterion {
  return {
    criterionType,
    displayOrder,
    selectedSkills: [],
  };
}

/** Splits requiredSkillNames into the selectedSkills array p-multiSelect binds to. */
export function parseSelectedSkills(requiredSkillNames: string | undefined): string[] {
  return (requiredSkillNames || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
