export interface IInterviewEvaluationScoreRequest {
  scorecardCriterionId: number;
  score: number;
}

export interface IInterviewEvaluationScoreResponse {
  scorecardCriterionId: number;
  criterionName: string;
  weight: number;
  maxScore: number;
  score: number;
}

export interface IInterviewEvaluationSubmitRequest {
  employeeId: number;
  scorecardId: number;
  scores: IInterviewEvaluationScoreRequest[];
  overallComments?: string | null;
}

export interface IInterviewEvaluationUpdateRequest {
  scores: IInterviewEvaluationScoreRequest[];
  overallComments?: string | null;
}

export interface IInterviewEvaluationResponse {
  interviewEvaluationId: number;
  interviewId: number;
  employeeId: number;
  scorecardId: number;
  scorecardName: string;
  overallComments?: string | null;
  submittedAt: string;
  submittedByUserName?: string | null;
  scores: IInterviewEvaluationScoreResponse[];
  weightedScore: number;
}
