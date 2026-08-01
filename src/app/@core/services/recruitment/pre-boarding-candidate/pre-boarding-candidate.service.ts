import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IPreBoardingSaveRequest, IPreBoardingSubmissionResponse } from '@core/interfaces/recruitment-management/pre-boarding.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class PreBoardingCandidateService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/me/pre-boarding';

  get() {
    return this.httpClient.get<ApiResponse<IPreBoardingSubmissionResponse>>(`${this.API_URL}`);
  }

  isEligible() {
    return this.httpClient.get<ApiResponse<boolean>>(`${this.API_URL}/eligible`);
  }

  saveDraft(request: IPreBoardingSaveRequest) {
    return this.httpClient.put<ApiResponse<IPreBoardingSubmissionResponse>>(`${this.API_URL}`, request);
  }

  submit() {
    return this.httpClient.post<ApiResponse<IPreBoardingSubmissionResponse>>(`${this.API_URL}/submit`, {});
  }
}
