import { StageProgressStatusEnum } from '@app/@core/enums/recruitment.enum';

export interface IPipelineStageProgress {
  pipelineStageId: number;
  stageName: string;
  stageType: string;
  displayOrder: number;
  stageDescription?: string;
  passingCriteria?: string;
  requiredDocuments?: string;
  estimatedDurationMinutes?: number;
  status: StageProgressStatusEnum;
  scheduledDate?: string;
  meetingLink?: string;
  notes?: string;
  score?: number;
  completedAt?: string;
  lastUpdatedByUserName?: string;
}

export interface IJobApplicationPipelineProgress {
  jobApplicationId: number;
  hasPipeline: boolean;
  pipelineName?: string;
  stages: IPipelineStageProgress[];
}

export interface IPipelineStageProgressUpdateRequest {
  status?: StageProgressStatusEnum;
  scheduledDate?: string;
  meetingLink?: string;
  notes?: string;
  score?: number;
}
