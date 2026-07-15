export interface ICandidateProfilePersonalInfoUpdateRequest {
  fullName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationalId?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  maritalStatus?: string | null;
  religion?: string | null;
  nationality?: string | null;
}

export interface ICandidateProfileContactUpdateRequest {
  email: string;
  phone?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
}

export interface ICandidateProfileResponse extends ICandidateProfilePersonalInfoUpdateRequest, ICandidateProfileContactUpdateRequest {
  candidateProfileId: number;
  profilePhotoPath?: string | null;
  signaturePath?: string | null;
  completenessPercentage: number;
}

export interface ICandidateEducationCreateRequest {
  degreeTitle: string;
  institution: string;
  educationLevel?: string | null;
  passingYear: number;
  result: string;
  majorSubject?: string | null;
}

export type ICandidateEducationUpdateRequest = ICandidateEducationCreateRequest;

export interface ICandidateEducationResponse extends ICandidateEducationCreateRequest {
  candidateEducationId: number;
}

export interface ICandidateWorkExperienceCreateRequest {
  companyName: string;
  designation: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  responsibilities: string;
  location?: string | null;
}

export type ICandidateWorkExperienceUpdateRequest = ICandidateWorkExperienceCreateRequest;

export interface ICandidateWorkExperienceResponse extends ICandidateWorkExperienceCreateRequest {
  candidateWorkExperienceId: number;
}

export interface ICandidateSkillCreateRequest {
  skillName: string;
  skillLibraryItemId?: number | null;
  proficiencyLevel?: string | null;
}

export interface ICandidateSkillResponse extends ICandidateSkillCreateRequest {
  candidateSkillId: number;
}

export interface ISkillLibraryItemResponse {
  skillLibraryItemId: number;
  name: string;
}

export interface ICandidateCertificationResponse {
  candidateCertificationId: number;
  certificationName: string;
  issuingOrganization?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  credentialId?: string | null;
  certificateFilePath?: string | null;
}

export interface ICandidateResumeParsedEducation {
  degreeTitle?: string | null;
  institution?: string | null;
  educationLevel?: string | null;
  passingYear?: number | null;
  result?: string | null;
  majorSubject?: string | null;
}

export interface ICandidateResumeParsedWorkExperience {
  companyName?: string | null;
  designation?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean | null;
  responsibilities?: string | null;
  location?: string | null;
}

export interface ICandidateResumeParseResponse {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  presentAddress?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  skills: string[];
  educations: ICandidateResumeParsedEducation[];
  workExperiences: ICandidateResumeParsedWorkExperience[];
  parsingProvider?: string | null;
  aiParsingDegraded?: boolean;
}

export type CandidateDocumentType = 'NID' | 'EducationCertificate' | 'ExperienceLetter' | 'Other';

export interface ICandidateDocumentResponse {
  candidateDocumentId: number;
  documentType: CandidateDocumentType;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  isActive: boolean;
  downloadUrl: string;
}

// ── HR/Admin read-only candidate view (US-009) ──────────────────────

export interface ICandidateProfileSummaryResponse {
  candidateProfileId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  profilePhotoPath?: string | null;
  completenessPercentage: number;
}

export type ApplicationStatus = 'Applied' | 'Screening' | 'Shortlisted' | 'InterviewScheduled' | 'Interviewed' | 'Offered' | 'Hired' | 'Rejected' | 'Withdrawn';

export interface IApplicationHistoryItem {
  jobApplicationId: number;
  jobPostingId: number;
  jobPostingTitle?: string | null;
  applicationStatus: ApplicationStatus;
  appliedDate?: string | null;
}

export interface ICandidateProfileDetailResponse extends ICandidateProfileResponse {
  educations: ICandidateEducationResponse[];
  workExperiences: ICandidateWorkExperienceResponse[];
  skills: ICandidateSkillResponse[];
  certifications: ICandidateCertificationResponse[];
  documents: ICandidateDocumentResponse[];
  applicationHistory: IApplicationHistoryItem[];
  hrNotes?: string | null;
}

export interface ICandidateProfileHrNotesUpdateRequest {
  hrNotes?: string | null;
}
