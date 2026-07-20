import type { ICandidateProfileSummaryResponse } from './candidate-profile.interface';

export interface ITalentPoolResponse {
  talentPoolId: number;
  name: string;
  candidateCount: number;
  createdAt?: string | null;
  jobPostingId?: number | null;
  jobPostingTitle?: string | null;
}

export interface ITalentPoolLookupResponse {
  talentPoolId: number;
  name: string;
}

export interface ITalentPoolBadgeResponse {
  talentPoolId: number;
  name: string;
}

export interface ITalentPoolDetailResponse {
  talentPoolId: number;
  name: string;
  jobPostingId?: number | null;
  jobPostingTitle?: string | null;
  candidates: ICandidateProfileSummaryResponse[];
}

export interface ITalentPoolCreateRequest {
  name: string;
  jobPostingId?: number | null;
}

export interface ITalentPoolUpdateRequest {
  name: string;
  jobPostingId?: number | null;
}

export interface ITalentPoolCandidateAddRequest {
  candidateProfileIds: number[];
}

export interface ITalentPoolCandidateAddResponse {
  addedCount: number;
  alreadyInPoolCount: number;
  notFoundCount: number;
}

export interface ITalentPoolFastTrackRequest {
  candidateProfileIds: number[];
  jobPostingId: number;
}

export interface ITalentPoolFastTrackResponse {
  processedCount: number;
  fastTrackedCount: number;
  alreadyAppliedCount: number;
  skippedCount: number;
}
