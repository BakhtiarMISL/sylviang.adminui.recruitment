import { IPipelineStage } from '@app/@core/interfaces/recruitment-management/hiring-pipeline.interface';

// Suggested stage types shown in the builder — mirrors PipelineStageTypes.Suggested on the
// backend, but StageType is free text end-to-end so admins can type a custom value too.
export const SuggestedStageTypes: string[] = [
  'Application',
  'CvScreening',
  'ResumeReview',
  'PhoneScreening',
  'OnlineTest',
  'CodingTest',
  'TechnicalAssessment',
  'WrittenTest',
  'AptitudeTest',
  'PsychometricTest',
  'PracticalAssessment',
  'Assignment',
  'PortfolioReview',
  'CaseStudy',
  'Presentation',
  'GroupDiscussion',
  'TechnicalInterview',
  'FunctionalInterview',
  'ManagerInterview',
  'BehavioralInterview',
  'HrInterview',
  'PanelInterview',
  'ExecutiveInterview',
  'MedicalExamination',
  'ReferenceCheck',
  'BackgroundVerification',
  'SalaryNegotiation',
  'Offer',
  'Joining',
  'Onboarding',
  'Rejected',
  'Custom / General',
];

export function newStage(displayOrder: number): IPipelineStage {
  return {
    name: '',
    stageType: '',
    displayOrder,
    isMandatory: true,
    manualApprovalRequired: false,
  };
}
