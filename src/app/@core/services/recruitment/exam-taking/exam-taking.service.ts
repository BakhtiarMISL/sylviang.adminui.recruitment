import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IExamPaperResponse,
  IExamSubmitRequest,
  IExamSubmitResultResponse,
  IMyExamEnrollmentResponse,
} from '@core/interfaces/recruitment-management/exam-taking.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ExamTakingService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/exam-taking';

  getMyEnrollments() {
    return this.httpClient.get<ApiResponse<IMyExamEnrollmentResponse[]>>(`${this.API_URL}/enrollments`);
  }

  startExam(examEnrollmentId: number) {
    return this.httpClient.post<ApiResponse<IExamPaperResponse>>(`${this.API_URL}/enrollments/${examEnrollmentId}/start`, {});
  }

  submitExam(examEnrollmentId: number, request: IExamSubmitRequest) {
    return this.httpClient.post<ApiResponse<IExamSubmitResultResponse>>(`${this.API_URL}/enrollments/${examEnrollmentId}/submit`, request);
  }

  /** Admit card PDF for one of the candidate's own enrollments (US-057 AC4). */
  downloadMyAdmitCard(examEnrollmentId: number) {
    return this.httpClient.get(`${this.API_URL}/enrollments/${examEnrollmentId}/admit-card/download`, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
