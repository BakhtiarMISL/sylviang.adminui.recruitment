import { CircularTypeEnum, EducationLevelEnum, EmploymentTypeEnum, JobStatusEnum } from '@app/@core/enums/recruitment.enum';

export const EmploymentTypeOptions = [
  { label: 'Full Time', value: EmploymentTypeEnum.FullTime },
  { label: 'Part Time', value: EmploymentTypeEnum.PartTime },
  { label: 'Contract', value: EmploymentTypeEnum.Contract },
  { label: 'Internship', value: EmploymentTypeEnum.Internship },
];

export const CircularTypeOptions = [
  { label: 'Internal Only', value: CircularTypeEnum.InternalOnly },
  { label: 'External Only', value: CircularTypeEnum.ExternalOnly },
  { label: 'Both', value: CircularTypeEnum.Both },
];

export const EducationLevelOptions = [
  { label: 'Below SSC', value: EducationLevelEnum.BelowSSC },
  { label: 'SSC', value: EducationLevelEnum.SSC },
  { label: 'HSC', value: EducationLevelEnum.HSC },
  { label: 'Diploma', value: EducationLevelEnum.Diploma },
  { label: 'Bachelor', value: EducationLevelEnum.Bachelor },
  { label: 'Master', value: EducationLevelEnum.Master },
  { label: 'Doctorate', value: EducationLevelEnum.Doctorate },
];

export const JobStatusOptions = [
  { label: 'Draft', value: JobStatusEnum.Draft },
  { label: 'Open', value: JobStatusEnum.Open },
  { label: 'On Hold', value: JobStatusEnum.OnHold },
  { label: 'Closed', value: JobStatusEnum.Closed },
  { label: 'Archived', value: JobStatusEnum.Archived },
];

// Currency is a free-text field on the backend (max 10 chars, no enum), so this list only
// drives autocomplete suggestions — typing a code/name not in this list is still accepted.
export const CurrencyOptions = [
  { code: 'BDT', name: 'Bangladeshi Taka' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
];

// Legal next-states per the backend's status transition rules. This is a UX nicety only —
// the server is the source of truth and will reject illegal transitions with a 400.
export const JobStatusLegalNextStates: Record<JobStatusEnum, JobStatusEnum[]> = {
  [JobStatusEnum.Draft]: [JobStatusEnum.Draft, JobStatusEnum.Open],
  [JobStatusEnum.Open]: [JobStatusEnum.Open, JobStatusEnum.OnHold, JobStatusEnum.Closed],
  [JobStatusEnum.OnHold]: [JobStatusEnum.OnHold, JobStatusEnum.Open],
  [JobStatusEnum.Closed]: [JobStatusEnum.Closed, JobStatusEnum.Archived],
  [JobStatusEnum.Archived]: [JobStatusEnum.Archived],
};
