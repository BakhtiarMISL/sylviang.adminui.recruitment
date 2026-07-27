import { EmploymentTypeEnum } from '@app/@core/enums/recruitment.enum';

export const EmploymentTypeOptions = [
  { label: 'Full Time', value: EmploymentTypeEnum.FullTime },
  { label: 'Part Time', value: EmploymentTypeEnum.PartTime },
  { label: 'Contract', value: EmploymentTypeEnum.Contract },
  { label: 'Internship', value: EmploymentTypeEnum.Internship },
];

// Experience buckets are a client-side UX convenience — they map to a single
// maxExperienceYears value sent to the API (the backend has no bucket concept).
export const ExperienceBucketOptions = [
  { label: '0-1 years', value: 1 },
  { label: '2-4 years', value: 4 },
  { label: '5-9 years', value: 9 },
  { label: '10+ years', value: 50 },
];

export const RESUME_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// US-005 AC3: internal candidates must attach a PDF specifically (backend rejects anything
// else for Source=Internal) - unlike the external career-portal form, which still allows
// PDF/DOC/DOCX.
export const RESUME_ALLOWED_EXTENSIONS = ['.pdf'];
