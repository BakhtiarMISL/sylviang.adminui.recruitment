import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IPreBoardingRequestCorrectionRequest, IPreBoardingSubmissionResponse } from '@core/interfaces/recruitment-management/pre-boarding.interface';
import { BASE_URL_Recruitment } from '@env/environment';

// EP-12 US-096: HR-facing validate/lock + correction-request workflow, distinct from the
// candidate-only PreBoardingCandidateService.
@Injectable({
  providedIn: 'root',
})
export class PreBoardingService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/pre-boarding';

  getByPool(finalSelectionPoolId: number) {
    return this.httpClient.get<ApiResponse<IPreBoardingSubmissionResponse>>(`${this.API_URL}/by-pool/${finalSelectionPoolId}`);
  }

  validate(preBoardingSubmissionId: number) {
    return this.httpClient.post<ApiResponse<IPreBoardingSubmissionResponse>>(`${this.API_URL}/${preBoardingSubmissionId}/validate`, {});
  }

  requestCorrection(preBoardingSubmissionId: number, request: IPreBoardingRequestCorrectionRequest) {
    return this.httpClient.post<ApiResponse<IPreBoardingSubmissionResponse>>(`${this.API_URL}/${preBoardingSubmissionId}/request-correction`, request);
  }
}
