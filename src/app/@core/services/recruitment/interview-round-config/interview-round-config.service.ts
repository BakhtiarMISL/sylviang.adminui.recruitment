import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IInterviewRoundConfigReplaceRequest,
  IInterviewRoundConfigResponse,
} from '@core/interfaces/recruitment-management/interview-round-config.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class InterviewRoundConfigService {
  constructor(private httpClient: HttpClient) {}

  private roundConfigUrl(jobPostingId: number) {
    return `${BASE_URL_Recruitment}/job-posting/${jobPostingId}/interview-round-config`;
  }

  getAllByJobPosting(jobPostingId: number) {
    return this.httpClient.get<ApiResponse<IInterviewRoundConfigResponse[]>>(this.roundConfigUrl(jobPostingId));
  }

  replace(jobPostingId: number, request: IInterviewRoundConfigReplaceRequest) {
    return this.httpClient.put<ApiResponse<void>>(this.roundConfigUrl(jobPostingId), request);
  }
}
