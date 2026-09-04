export interface IPipelineStage {
  pipelineStageId?: number;
  name: string;
  stageType: string;
  displayOrder: number;
  description?: string;
  passingCriteria?: string;
  isActive?: boolean;
  isMandatory: boolean;
  estimatedDurationMinutes?: number;
  slaDays?: number;
  maxMarks?: number;
  passMarks?: number;
  requiredDocuments?: string;
  autoProgressionRule?: string;
  autoProgressionTargetDisplayOrder?: number;
  manualApprovalRequired: boolean;
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
