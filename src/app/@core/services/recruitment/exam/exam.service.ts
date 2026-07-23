import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import { IExamCreateRequest, IExamResponse } from '@core/interfaces/recruitment-management/exam.interface';
import { IExamEnrollmentResponse } from '@core/interfaces/recruitment-management/exam-enrollment.interface';
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
}
