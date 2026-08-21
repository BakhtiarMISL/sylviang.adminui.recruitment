import { HrOverrideDecisionEnum } from '@app/@core/enums/recruitment.enum';

export interface IAutoShortlistRunRequest {
  jobPostingId: number;
  cutoffScore: number;
}

export interface IAutoShortlistResult {
  autoShortlistResultId: number;
  jobApplicationId: number;
  candidateName: string;
  score: number | null;
  explanation: string | null;
  matchedSkills: string[];
  experienceBand: string | null;
  scoringFailed: boolean;
  scoringError: string | null;
  passed: boolean;
  hrOverrideDecision: HrOverrideDecisionEnum | null;
  finalIncluded: boolean;
}

export interface IAutoShortlistRun {
  autoShortlistRunId: number;
  jobPostingId: number;
  provider: 'Manual' | 'Ai';
  cutoffScore: number;
  runAt: string;
  totalApplications: number;
  totalScored: number;
  totalFailed: number;
  results: IAutoShortlistResult[];
}

export interface IAutoShortlistCutoffUpdateRequest {
  cutoffScore: number;
}

export interface IAutoShortlistOverrideRequest {
  decision: HrOverrideDecisionEnum | null;
}

export interface IAutoShortlistApplyFailure {
  jobApplicationId: number;
  reason: string;
}

export interface IAutoShortlistApplyResponse {
  totalProcessed: number;
  totalShortlisted: number;
  totalFailed: number;
  failures: IAutoShortlistApplyFailure[];
}
