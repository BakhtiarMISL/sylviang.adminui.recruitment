import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import {
  IInterviewBulkCancelRequest,
  IInterviewBulkRescheduleRequest,
  IInterviewBulkScheduleRequest,
  IInterviewCancelRequest,
  IInterviewMarkResultRequest,
  IInterviewRescheduleRequest,
  IInterviewResponse,
  IInterviewScheduleRequest,
} from '@core/interfaces/recruitment-management/interview.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class InterviewService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/interview';

  getPaged(params: any) {
    return this.httpClient.get<ApiResponse<PaginatedResponse<IInterviewResponse[]>>>(`${this.API_URL}/paged`, { params });
  }

  getById(interviewId: number) {
    return this.httpClient.get<ApiResponse<IInterviewResponse>>(`${this.API_URL}/${interviewId}`);
  }

  getByJobApplication(jobApplicationId: number) {
    return this.httpClient.get<ApiResponse<IInterviewResponse[]>>(`${this.API_URL}/job-application/${jobApplicationId}`);
  }

  schedule(request: IInterviewScheduleRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  bulkSchedule(request: IInterviewBulkScheduleRequest) {
    return this.httpClient.post<ApiResponse<number[]>>(`${this.API_URL}/bulk`, request);
  }

  reschedule(interviewId: number, request: IInterviewRescheduleRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${interviewId}/reschedule`, request);
  }

  bulkReschedule(request: IInterviewBulkRescheduleRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/bulk/reschedule`, request);
  }

  cancel(interviewId: number, request: IInterviewCancelRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${interviewId}/cancel`, request);
  }

  bulkCancel(request: IInterviewBulkCancelRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/bulk/cancel`, request);
  }

  markResult(interviewId: number, request: IInterviewMarkResultRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${interviewId}/result`, request);
  }
}
