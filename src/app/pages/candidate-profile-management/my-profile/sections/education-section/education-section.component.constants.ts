import { EducationLevelEnum, GradingSystemEnum } from '@app/@core/enums/recruitment.enum';

export const EducationLevelOptions = [
  { label: 'Below SSC', value: EducationLevelEnum.BelowSSC },
  { label: 'SSC', value: EducationLevelEnum.SSC },
  { label: 'HSC', value: EducationLevelEnum.HSC },
  { label: 'Diploma', value: EducationLevelEnum.Diploma },
  { label: 'Bachelor', value: EducationLevelEnum.Bachelor },
  { label: 'Master', value: EducationLevelEnum.Master },
  { label: 'Doctorate', value: EducationLevelEnum.Doctorate },
];

export const GradingSystemOptions = [
  { label: 'GPA', value: GradingSystemEnum.GPA },
  { label: 'CGPA', value: GradingSystemEnum.CGPA },
  { label: 'Division', value: GradingSystemEnum.Division },
];

// Shown as the Result options only when GradingSystem = Division (GPA/CGPA use a free-text
// numeric Result input instead).
export const DivisionResultOptions = [
  { label: 'First Division', value: 'First' },
  { label: 'Second Division', value: 'Second' },
  { label: 'Third Division', value: 'Third' },
];
