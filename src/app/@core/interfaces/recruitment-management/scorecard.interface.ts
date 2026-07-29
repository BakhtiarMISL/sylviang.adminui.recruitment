export interface IScorecardCriterionRequest {
  name: string;
  weight: number;
  maxScore: number;
  displayOrder: number;
}

export interface IScorecardCriterionResponse {
  scorecardCriterionId: number;
  name: string;
  weight: number;
  maxScore: number;
  displayOrder: number;
}

export interface IScorecardRequest {
  name: string;
  description?: string | null;
  criteria: IScorecardCriterionRequest[];
}

export interface IScorecardResponse {
  scorecardId: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  criteria: IScorecardCriterionResponse[];
}

export interface IScorecardLookupResponse {
  scorecardId: number;
  name: string;
}
