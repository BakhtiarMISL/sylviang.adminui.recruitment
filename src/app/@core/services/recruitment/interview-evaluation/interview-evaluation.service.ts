import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IInterviewEvaluationResponse,
  IInterviewEvaluationSubmitRequest,
  IInterviewEvaluationUpdateRequest,
} from '@core/interfaces/recruitment-management/interview-evaluation.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class InterviewEvaluationService {
  constructor(private httpClient: HttpClient) {}

  private evaluationUrl(interviewId: number) {
    return `${BASE_URL_Recruitment}/interview/${interviewId}/evaluation`;
  }

  getByInterview(interviewId: number) {
    return this.httpClient.get<ApiResponse<IInterviewEvaluationResponse[]>>(this.evaluationUrl(interviewId));
  }

  getById(interviewId: number, evaluationId: number) {
    return this.httpClient.get<ApiResponse<IInterviewEvaluationResponse>>(`${this.evaluationUrl(interviewId)}/${evaluationId}`);
  }

  submit(interviewId: number, request: IInterviewEvaluationSubmitRequest) {
    return this.httpClient.post<ApiResponse<number>>(this.evaluationUrl(interviewId), request);
  }

  update(interviewId: number, evaluationId: number, request: IInterviewEvaluationUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.evaluationUrl(interviewId)}/${evaluationId}`, request);
  }

  exportResultsExcel(interviewId: number) {
    return this.httpClient.get(`${this.evaluationUrl(interviewId)}/export-excel`, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
