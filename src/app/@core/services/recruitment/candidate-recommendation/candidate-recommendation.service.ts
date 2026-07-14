import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  ICandidateRecommendationCreateRequest,
  ICandidateRecommendationPendingListItem,
  ICandidateRecommendationResponse,
  ICandidateRecommendationReviewRequest,
} from '@core/interfaces/recruitment-management/candidate-recommendation.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class CandidateRecommendationService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment;

  getLatest(jobApplicationId: number) {
    return this.httpClient.get<ApiResponse<ICandidateRecommendationResponse | null>>(`${this.API_URL}/job-application/${jobApplicationId}/recommendation`);
  }

  create(jobApplicationId: number, request: ICandidateRecommendationCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}/job-application/${jobApplicationId}/recommendation`, request);
  }

  getPending() {
    return this.httpClient.get<ApiResponse<ICandidateRecommendationPendingListItem[]>>(`${this.API_URL}/candidate-recommendation/pending`);
  }

  review(candidateRecommendationId: number, request: ICandidateRecommendationReviewRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/candidate-recommendation/${candidateRecommendationId}/review`, request);
  }
}
