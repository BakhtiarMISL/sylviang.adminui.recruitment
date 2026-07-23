import { RecommendationStatusEnum } from '@app/@core/enums/recruitment.enum';

export interface ICandidateRecommendationCreateRequest {
  justification: string;
}

export interface ICandidateRecommendationReviewRequest {
  status: RecommendationStatusEnum;
  reviewComments?: string;
}

export interface ICandidateRecommendationResponse {
  candidateRecommendationId: number;
  jobApplicationId: number;
  justification: string;
  recommendedByUserName: string;
  recommendedAt: string;
  status: RecommendationStatusEnum;
  reviewComments?: string | null;
  reviewedByUserName?: string | null;
  reviewedAt?: string | null;
}

/** One row in the Hiring Manager's pending-recommendations review queue (AC3). */
export interface ICandidateRecommendationPendingListItem {
  candidateRecommendationId: number;
  jobApplicationId: number;
  candidateName: string;
  jobPostingTitle?: string | null;
  justification: string;
  recommendedByUserName: string;
  recommendedAt: string;
}
