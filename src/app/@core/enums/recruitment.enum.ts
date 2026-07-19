export enum EmploymentTypeEnum {
  FullTime = 'FullTime',
  PartTime = 'PartTime',
  Contract = 'Contract',
  Internship = 'Internship',
}

export enum JobStatusEnum {
  Draft = 'Draft',
  Open = 'Open',
  OnHold = 'OnHold',
  Closed = 'Closed',
  Archived = 'Archived',
}

export enum CircularTypeEnum {
  InternalOnly = 'InternalOnly',
  ExternalOnly = 'ExternalOnly',
  Both = 'Both',
}

export enum EducationLevelEnum {
  BelowSSC = 'BelowSSC',
  SSC = 'SSC',
  HSC = 'HSC',
  Diploma = 'Diploma',
  Bachelor = 'Bachelor',
  Master = 'Master',
  Doctorate = 'Doctorate',
}

export enum ApplicationSourceEnum {
  External = 'External',
  Internal = 'Internal',
  Admin = 'Admin',
}

export enum ApplicationStatusEnum {
  Applied = 'Applied',
  Screening = 'Screening',
  Shortlisted = 'Shortlisted',
  InterviewScheduled = 'InterviewScheduled',
  Interviewed = 'Interviewed',
  Offered = 'Offered',
  Hired = 'Hired',
  Rejected = 'Rejected',
  Withdrawn = 'Withdrawn',
  DuplicateDismissed = 'DuplicateDismissed',
}

export enum StageProgressStatusEnum {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Rejected = 'Rejected',
}

export enum CriterionTypeEnum {
  EducationLevel = 'EducationLevel',
  MinExperienceYears = 'MinExperienceYears',
  RequiredSkills = 'RequiredSkills',
  AgeRange = 'AgeRange',
  District = 'District',
  MinScreeningScore = 'MinScreeningScore',
}

export enum FilterCombinatorEnum {
  And = 'And',
  Or = 'Or',
}

export enum HrOverrideDecisionEnum {
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum StageTypeEnum {
  WrittenTest = 'WrittenTest',
  AptitudeTest = 'AptitudeTest',
  PsychometricTest = 'PsychometricTest',
  GroupDiscussion = 'GroupDiscussion',
  PracticalAssessment = 'PracticalAssessment',
}

export enum RecommendationStatusEnum {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
}
