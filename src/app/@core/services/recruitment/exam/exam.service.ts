import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import { IExamCreateRequest, IExamResponse } from '@core/interfaces/recruitment-management/exam.interface';
import {
  IExamAdmitCardDistributeBulkResponse,
  IExamEnrollmentResponse,
  IExamResultsBulkMoveStageRequest,
  IExamScoreBulkUploadResponse,
} from '@core/interfaces/recruitment-management/exam-enrollment.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/exam';

  getPaged(params: any) {
    return this.httpClient.get<ApiResponse<PaginatedResponse<IExamResponse[]>>>(`${this.API_URL}/paged`, { params });
  }

  getById(examId: number) {
    return this.httpClient.get<ApiResponse<IExamResponse>>(`${this.API_URL}/${examId}`);
  }

  create(request: IExamCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  enroll(examId: number, jobApplicationIds: number[]) {
    return this.httpClient.post<ApiResponse<number[]>>(`${this.API_URL}/${examId}/enroll`, jobApplicationIds);
  }

  getEnrollments(examId: number) {
    return this.httpClient.get<ApiResponse<IExamEnrollmentResponse[]>>(`${this.API_URL}/${examId}/enrollments`);
  }

  generateSeatPlan(examId: number) {
    return this.httpClient.post<ApiResponse<void>>(`${this.API_URL}/${examId}/seat-plan/generate`, {});
  }

  reassignSeat(examId: number, enrollmentId: number, examRoomId: number, seatNumber: string) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${examId}/enrollments/${enrollmentId}/seat`, { examRoomId, seatNumber });
  }

  downloadSeatPlanPdf(examId: number) {
    return this.httpClient.get(`${this.API_URL}/${examId}/seat-plan/download/pdf`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  downloadSeatPlanExcel(examId: number) {
    return this.httpClient.get(`${this.API_URL}/${examId}/seat-plan/download/excel`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  downloadAdmitCard(examId: number, enrollmentId: number) {
    return this.httpClient.get(`${this.API_URL}/${examId}/enrollments/${enrollmentId}/admit-card/download`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  /** Raw XLSX bytes (US-059 AC2) - not ApiResponse-wrapped, the endpoint returns a binary file. */
  downloadScoreUploadTemplate(examId: number) {
    return this.httpClient.get(`${this.API_URL}/${examId}/score-upload-template`, { responseType: 'blob' });
  }

  bulkUploadScores(examId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.httpClient.post<ApiResponse<IExamScoreBulkUploadResponse>>(`${this.API_URL}/${examId}/score-upload/bulk`, formData);
  }

  uploadScore(examId: number, enrollmentId: number, score: number) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${examId}/enrollments/${enrollmentId}/score`, { score });
  }

  /** Re-sends the admit-card email+SMS to every enrolled candidate in one action (US-057 AC2/AC3). */
  distributeAdmitCards(examId: number) {
    return this.httpClient.post<ApiResponse<IExamAdmitCardDistributeBulkResponse>>(`${this.API_URL}/${examId}/admit-cards/distribute`, {});
  }

  /** All admit cards for this exam, bundled as a single ZIP (US-057 AC5). */
  downloadAdmitCardsZip(examId: number) {
    return this.httpClient.get(`${this.API_URL}/${examId}/admit-cards/download/zip`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  /** Exam results (score/pass-fail) exported to Excel, sorted by score descending (US-060 AC4). */
  downloadResultsExcel(examId: number) {
    return this.httpClient.get(`${this.API_URL}/${examId}/results/export/excel`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  /** Bulk-moves selected passing candidates to a chosen pipeline stage (US-060 AC5). */
  bulkMoveResultsToStage(examId: number, request: IExamResultsBulkMoveStageRequest) {
    return this.httpClient.post<ApiResponse<void>>(`${this.API_URL}/${examId}/results/bulk-move-stage`, request);
  }
}
