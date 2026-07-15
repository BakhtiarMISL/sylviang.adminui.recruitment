import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IAutoShortlistApplyResponse,
  IAutoShortlistCutoffUpdateRequest,
  IAutoShortlistOverrideRequest,
  IAutoShortlistResult,
  IAutoShortlistRun,
  IAutoShortlistRunRequest,
} from '@core/interfaces/recruitment-management/auto-shortlist.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class AutoShortlistService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/auto-shortlist';

  run(request: IAutoShortlistRunRequest) {
    return this.httpClient.post<ApiResponse<IAutoShortlistRun>>(`${this.API_URL}/run`, request);
  }

  getLatest(jobPostingId: number) {
    return this.httpClient.get<ApiResponse<IAutoShortlistRun | null>>(`${this.API_URL}/${jobPostingId}/latest`);
  }

  adjustCutoff(runId: number, request: IAutoShortlistCutoffUpdateRequest) {
    return this.httpClient.patch<ApiResponse<IAutoShortlistRun>>(`${this.API_URL}/${runId}/cutoff`, request);
  }

  override(resultId: number, request: IAutoShortlistOverrideRequest) {
    return this.httpClient.patch<ApiResponse<IAutoShortlistResult>>(`${this.API_URL}/result/${resultId}/override`, request);
  }

  apply(runId: number) {
    return this.httpClient.post<ApiResponse<IAutoShortlistApplyResponse>>(`${this.API_URL}/${runId}/apply`, {});
  }
}
