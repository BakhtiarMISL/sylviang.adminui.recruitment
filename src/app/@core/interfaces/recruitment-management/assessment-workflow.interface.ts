import { StageTypeEnum } from '@app/@core/enums/recruitment.enum';

export interface IAssessmentStage {
  assessmentStageId?: number;
  stageType: StageTypeEnum;
  maxMarks: number;
  passMarks: number;
  durationMinutes: number;
  displayOrder: number;
  isMandatory: boolean;
}

export interface IAssessmentWorkflowCreateRequest {
  name: string;
  description?: string;
  stages: IAssessmentStage[];
}

export interface IAssessmentWorkflowUpdateRequest extends IAssessmentWorkflowCreateRequest {}

export interface IAssessmentWorkflowResponse {
  assessmentWorkflowId: number;
  name: string;
  description?: string;
  isActive: boolean;
  jobPostingCount: number;
  stages: IAssessmentStage[];
}

export interface IAssessmentWorkflowLookupResponse {
  assessmentWorkflowId: number;
  name: string;
}
