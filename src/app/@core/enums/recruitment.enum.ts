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

export enum QuestionTypeEnum {
  McqSingle = 'McqSingle',
  McqMultiple = 'McqMultiple',
  TrueFalse = 'TrueFalse',
  Subjective = 'Subjective',
}

export enum DifficultyLevelEnum {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export enum GradingSystemEnum {
  GPA = 'GPA',
  CGPA = 'CGPA',
  Division = 'Division',
}

export enum ExamTypeEnum {
  InPerson = 'InPerson',
  Online = 'Online',
}

/** Delivery status for a single ExamEnrollment's email/SMS notification. */
export enum NotificationStatusEnum {
  Pending = 'Pending',
  Sent = 'Sent',
  Failed = 'Failed',
  Skipped = 'Skipped',
}

/** How an ExamEnrollment's Score/IsPassed was set (US-058/US-059). */
export enum ScoreSourceEnum {
  AutoScored = 'AutoScored',
  ManualUpload = 'ManualUpload',
}

export enum ExamAttemptStatusEnum {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Submitted = 'Submitted',
}

export enum InterviewTypeEnum {
  InPerson = 'InPerson',
  Virtual = 'Virtual',
}

export enum InterviewStatusEnum {
  Scheduled = 'Scheduled',
  Rescheduled = 'Rescheduled',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
  NoShow = 'NoShow',
}

export enum InterviewResultEnum {
  Pending = 'Pending',
  Passed = 'Passed',
  Failed = 'Failed',
}

/** EP-09: recruitment event a NotificationTemplate can be mapped to via EventTemplateMapping. */
export enum RecruitmentEventEnum {
  ApplicationSubmitted = 'ApplicationSubmitted',
  ApplicationWithdrawn = 'ApplicationWithdrawn',
  ApplicationStatusChanged = 'ApplicationStatusChanged',
  CandidateActionRequired = 'CandidateActionRequired',
  InterviewScheduled = 'InterviewScheduled',
  InterviewRescheduled = 'InterviewRescheduled',
  InterviewCancelled = 'InterviewCancelled',
  ExamEnrolled = 'ExamEnrolled',
  AdmitCardIssued = 'AdmitCardIssued',
  ExamResultPublished = 'ExamResultPublished',
  AccountCreatedOtp = 'AccountCreatedOtp',
  OfferLetterAvailable = 'OfferLetterAvailable',
  OfferAccepted = 'OfferAccepted',
  OfferDeclined = 'OfferDeclined',
  AppointmentLetterGenerated = 'AppointmentLetterGenerated',
}

/** EP-09: delivery channel a NotificationTemplate is written for. */
export enum NotificationChannelEnum {
  Email = 'Email',
  Sms = 'Sms',
  InApp = 'InApp',
  Push = 'Push',
}

/** EP-09: which audience an EventTemplateMapping targets. */
export enum NotificationRecipientTypeEnum {
  Candidate = 'Candidate',
  AdminHr = 'AdminHr',
}

/** EP-10: the kind of letter/document a DocumentTemplate is written for. */
export enum DocumentTypeEnum {
  OfferLetter = 'OfferLetter',
  AppointmentLetter = 'AppointmentLetter',
  JoiningBooklet = 'JoiningBooklet',
  MedicalReferral = 'MedicalReferral',
  TargetLetter = 'TargetLetter',
  RejectionLetter = 'RejectionLetter',
  ExperienceCertificate = 'ExperienceCertificate',
  RelievingLetter = 'RelievingLetter',
  OfficeNote = 'OfficeNote',
}

/** EP-10 US-081: lifecycle of a single generated OfferLetter. */
export enum OfferLetterStatusEnum {
  Generated = 'Generated',
  Sent = 'Sent',
  Accepted = 'Accepted',
  Declined = 'Declined',
}

/** EP-10 US-085: unified acceptance status on the document-tracking dashboard. */
export enum DocumentAcceptanceStatusEnum {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Declined = 'Declined',
  NotApplicable = 'NotApplicable',
}

/** EP-12 US-095/096: lifecycle of a candidate's pre-boarding submission. */
export enum PreBoardingSubmissionStatusEnum {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Approved = 'Approved',
  NeedsCorrection = 'NeedsCorrection',
}
