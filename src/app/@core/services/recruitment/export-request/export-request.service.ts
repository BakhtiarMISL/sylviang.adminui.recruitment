import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import {
  IExportRequestCreateRequest,
  IExportRequestFilterRequest,
  IExportRequestResponse,
} from '@core/interfaces/recruitment-management/export-request.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ExportRequestService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/export-requests';

  requestCandidateListExport(request: IExportRequestCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}/candidate-list`, request);
  }

  /** US-101: queues a large bulk-CV-ZIP request - the synchronous counterpart is
   * JobApplicationService.bulkDownloadCvs, for small batches. */
  requestBulkCvZipExport(jobApplicationIds: number[]) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}/bulk-cv-zip`, { jobApplicationIds });
  }

  getAll(filter: IExportRequestFilterRequest) {
    return this.httpClient.get<ApiResponse<PaginatedResponse<IExportRequestResponse[]>>>(`${this.API_URL}`, {
      params: this.buildParams(filter),
    });
  }

  download(exportRequestId: number) {
    return this.httpClient.get(`${this.API_URL}/${exportRequestId}/download`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  private buildParams(filter: IExportRequestFilterRequest): HttpParams {
    let params = new HttpParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
