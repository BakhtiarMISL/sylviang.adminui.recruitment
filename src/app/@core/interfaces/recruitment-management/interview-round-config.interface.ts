export interface IInterviewRoundConfigRequest {
  interviewRoundConfigId?: number | null;
  name: string;
  sequence: number;
  scorecardId?: number | null;
  panelistEmployeeIds: number[];
}

export interface IInterviewRoundConfigResponse {
  interviewRoundConfigId: number;
  jobPostingId: number;
  name: string;
  sequence: number;
  scorecardId?: number | null;
  scorecardName?: string | null;
  panelistEmployeeIds: number[];
}

export interface IInterviewRoundConfigReplaceRequest {
  rounds: IInterviewRoundConfigRequest[];
}
