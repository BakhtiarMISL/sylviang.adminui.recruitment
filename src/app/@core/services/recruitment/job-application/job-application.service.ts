import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import {
  IApplicationStatusReason,
  IJobApplicationBulkStatusUpdateRequest,
  IJobApplicationBulkStatusUpdateResponse,
  IJobApplicationDetail,
  IJobApplicationListItem,
  IJobApplicationStatusUpdateRequest,
} from '@core/interfaces/recruitment-management/job-application.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class JobApplicationService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/job-application';

  getDashboardPaged(params: any) {
    return this.httpClient.get<ApiResponse<PaginatedResponse<IJobApplicationListItem[]>>>(`${this.API_URL}/dashboard/paged`, { params });
  }

  getDetail(jobApplicationId: number) {
    return this.httpClient.get<ApiResponse<IJobApplicationDetail>>(`${this.API_URL}/${jobApplicationId}/detail`);
  }

  getStatusReasons(status: string) {
    return this.httpClient.get<ApiResponse<IApplicationStatusReason[]>>(`${this.API_URL}/status-reasons`, { params: { status } });
  }

  updateStatus(jobApplicationId: number, request: IJobApplicationStatusUpdateRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${jobApplicationId}/status`, request);
  }

  bulkUpdateStatus(request: IJobApplicationBulkStatusUpdateRequest) {
    return this.httpClient.patch<ApiResponse<IJobApplicationBulkStatusUpdateResponse>>(`${this.API_URL}/bulk-status`, request);
  }
}
