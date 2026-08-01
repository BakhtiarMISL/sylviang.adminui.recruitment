import type { ITalentPoolBadgeResponse } from './talent-pool.interface';

export interface ICandidateProfilePersonalInfoUpdateRequest {
  fullName: string;
  dateOfBirth?: string | null;
  genderId?: number | null;
  nationalId?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  maritalStatusId?: number | null;
  religionId?: number | null;
  nationality?: string | null;
  bloodGroupId?: number | null;
}

export interface ICandidateProfileContactUpdateRequest {
  email: string;
  phone?: string | null;
  countryId?: number | null;

  presentDivisionId?: number | null;
  presentDistrictId?: number | null;
  presentThanaId?: number | null;
  presentAddressDetail?: string | null;

  homeDivisionId?: number | null;
  homeDistrictId?: number | null;
  homeThanaId?: number | null;
  permanentAddressDetail?: string | null;
}

export interface IDivisionResponse {
  divisionId: number;
  name: string;
}

export interface IDistrictResponse {
  districtId: number;
  name: string;
  divisionId: number;
}

export interface IThanaResponse {
  thanaId: number;
  name: string;
  districtId: number;
}

export interface ICandidateProfileResponse extends ICandidateProfilePersonalInfoUpdateRequest, ICandidateProfileContactUpdateRequest {
  candidateProfileId: number;
  phoneDialCode?: string | null;
  profilePhotoPath?: string | null;
  signaturePath?: string | null;
  completenessPercentage: number;
  // US-003 AC4: true once the candidate has a submitted application - Email/Phone/NationalId
  // lock in that state, since JobApplication self-service lookups match by Email.
  hasSubmittedApplication: boolean;
  // US-005: Core HR pre-population / internal-vs-external distinction.
  isInternal: boolean;
  departmentName?: string | null;
  designationName?: string | null;
  hasPrepopulatedFieldEdits: boolean;
}

export interface ICandidateEducationCreateRequest {
  degreeId: number;
  educationBoardId?: number | null;
  institution: string;
  universityLibraryItemId?: number | null;
  educationLevel?: string | null;
  passingYear: number;
  gradingSystem?: string | null;
  result: string;
  majorSubjectSscHscId?: number | null;
  majorSubjectUniversityId?: number | null;
  majorSubjectOtherText?: string | null;
}

export type ICandidateEducationUpdateRequest = ICandidateEducationCreateRequest;

export interface ICandidateEducationResponse extends ICandidateEducationCreateRequest {
  candidateEducationId: number;
}

export interface IUniversityLibraryItemResponse {
  universityLibraryItemId: number;
  name: string;
  code: string;
}

export interface IDegreeResponse {
  degreeId: number;
  name: string;
  fullName: string;
  position: number;
}

export interface IEducationBoardResponse {
  educationBoardId: number;
  code: string;
  name: string;
}

export interface ICountryResponse {
  countryId: number;
  name: string;
  code: string;
  dialCode: string;
}

export interface IGenderResponse {
  genderId: number;
  name: string;
}

export interface IMajorSubjectSscHscResponse {
  majorSubjectSscHscId: number;
  name: string;
}

export interface IMajorSubjectUniversityResponse {
  majorSubjectUniversityId: number;
  name: string;
}

export interface IMaritalStatusResponse {
  maritalStatusId: number;
  name: string;
}

export interface IReligionResponse {
  religionId: number;
  name: string;
}

export interface IBloodGroupResponse {
  bloodGroupId: number;
  name: string;
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
  universityLibraryItemId?: number | null;
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
  religion?: string | null;
  maritalStatus?: string | null;
  skills: string[];
  educations: ICandidateResumeParsedEducation[];
  workExperiences: ICandidateResumeParsedWorkExperience[];
  parsingProvider?: string | null;
  aiParsingDegraded?: boolean;
  resumeDocumentSaved?: boolean;
}

export type CandidateDocumentType = 'NID' | 'EducationCertificate' | 'ExperienceLetter' | 'Resume' | 'Other';

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
  phoneDialCode?: string | null;
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
  talentPools: ITalentPoolBadgeResponse[];
  tags: string[];
}

export interface ICandidateProfileHrNotesUpdateRequest {
  hrNotes?: string | null;
}

// ── Tags (US-041, HR-only) ────────────────────────────────────────

export interface ICandidateTagResponse {
  candidateTagId: number;
  tagName: string;
}

export interface ICandidateTagCreateRequest {
  tagName: string;
}
