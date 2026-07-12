import { CandidateDocumentType } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';

export const CandidateDocumentTypeOptions: { label: string; value: CandidateDocumentType }[] = [
  { label: 'NID', value: 'NID' },
  { label: 'Education Certificate', value: 'EducationCertificate' },
  { label: 'Experience Letter', value: 'ExperienceLetter' },
  { label: 'Other', value: 'Other' },
];
