import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  ITalentPoolCandidateAddRequest,
  ITalentPoolCandidateAddResponse,
  ITalentPoolCreateRequest,
  ITalentPoolDetailResponse,
  ITalentPoolFastTrackRequest,
  ITalentPoolFastTrackResponse,
  ITalentPoolLookupResponse,
  ITalentPoolResponse,
  ITalentPoolUpdateRequest,
} from '@core/interfaces/recruitment-management/talent-pool.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class TalentPoolService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/talent-pool';

  getAll(jobPostingId?: number) {
    const params = jobPostingId ? { jobPostingId } : {};
    return this.httpClient.get<ApiResponse<ITalentPoolResponse[]>>(`${this.API_URL}`, { params });
  }

  getLookup() {
    return this.httpClient.get<ApiResponse<ITalentPoolLookupResponse[]>>(`${this.API_URL}/lookup`);
  }

  getById(talentPoolId: number) {
    return this.httpClient.get<ApiResponse<ITalentPoolDetailResponse>>(`${this.API_URL}/${talentPoolId}`);
  }

  create(request: ITalentPoolCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(talentPoolId: number, request: ITalentPoolUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${talentPoolId}`, request);
  }

  delete(talentPoolId: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/${talentPoolId}`);
  }

  addCandidates(talentPoolId: number, request: ITalentPoolCandidateAddRequest) {
    return this.httpClient.post<ApiResponse<ITalentPoolCandidateAddResponse>>(`${this.API_URL}/${talentPoolId}/candidates`, request);
  }

  removeCandidate(talentPoolId: number, candidateProfileId: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/${talentPoolId}/candidates/${candidateProfileId}`);
  }

  fastTrack(request: ITalentPoolFastTrackRequest) {
    return this.httpClient.post<ApiResponse<ITalentPoolFastTrackResponse>>(`${this.API_URL}/fast-track`, request);
  }
}
