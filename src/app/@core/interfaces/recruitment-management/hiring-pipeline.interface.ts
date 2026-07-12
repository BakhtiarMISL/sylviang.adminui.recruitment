export interface IPipelineStage {
  pipelineStageId?: number;
  name: string;
  stageType: string;
  displayOrder: number;
  description?: string;
  passingCriteria?: string;
  isActive?: boolean;
  isMandatory: boolean;
  departmentId?: number;
  estimatedDurationMinutes?: number;
  slaDays?: number;
  colorBadge?: string;
  emailTemplate?: string;
  notifyCandidateOnEnter: boolean;
  notifyInterviewersOnAssign: boolean;
  requiredDocuments?: string;
  allowCandidateReschedule: boolean;
  autoProgressionRule?: string;
  manualApprovalRequired: boolean;
  interviewerEmployeeIds: number[];
}

export interface IHiringPipelineCreateRequest {
  name: string;
  description?: string;
  stages: IPipelineStage[];
}

export interface IHiringPipelineUpdateRequest extends IHiringPipelineCreateRequest {}

export interface IHiringPipelineResponse {
  hiringPipelineId: number;
  name: string;
  description?: string;
  isActive: boolean;
  jobPostingCount: number;
  stages: IPipelineStage[];
}

export interface IHiringPipelineLookupResponse {
  hiringPipelineId: number;
  name: string;
}
