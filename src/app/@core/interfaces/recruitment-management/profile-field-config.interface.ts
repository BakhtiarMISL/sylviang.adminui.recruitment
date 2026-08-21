export enum CandidateProfileFieldEnum {
  PhoneNumber = 'PhoneNumber',
  DateOfBirth = 'DateOfBirth',
  Gender = 'Gender',
  MaritalStatus = 'MaritalStatus',
  Religion = 'Religion',
  BloodGroup = 'BloodGroup',
  PresentAddress = 'PresentAddress',
  PermanentAddress = 'PermanentAddress',
  Photo = 'Photo',
  Signature = 'Signature',
  NidNumber = 'NidNumber',
  EducationDetails = 'EducationDetails',
  WorkExperience = 'WorkExperience',
  Skills = 'Skills',
  Certifications = 'Certifications',
}

export enum ProfileFieldVisibilityEnum {
  Mandatory = 'Mandatory',
  Optional = 'Optional',
  Hidden = 'Hidden',
}

export interface IProfileFieldConfigRequest {
  field: CandidateProfileFieldEnum;
  jobPostingId: number | null;
  visibility: ProfileFieldVisibilityEnum;
}

export interface IProfileFieldConfigResponse {
  profileFieldConfigId: number;
  field: CandidateProfileFieldEnum;
  jobPostingId: number | null;
  visibility: ProfileFieldVisibilityEnum;
}

export interface IEffectiveProfileFieldResponse {
  field: CandidateProfileFieldEnum;
  visibility: ProfileFieldVisibilityEnum;
}
