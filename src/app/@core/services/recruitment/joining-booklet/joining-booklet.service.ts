import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IJoiningBookletBulkDownloadRequest,
  IJoiningBookletBulkGenerateRequest,
  IJoiningBookletBulkGenerateResponse,
  IJoiningBookletEligibleCandidateResponse,
  IJoiningBookletGenerateRequest,
  IJoiningBookletResponse,
} from '@core/interfaces/recruitment-management/joining-booklet.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class JoiningBookletService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/joining-booklet';

  getEligibleCandidates() {
    return this.httpClient.get<ApiResponse<IJoiningBookletEligibleCandidateResponse[]>>(`${this.API_URL}/eligible-candidates`);
  }

  getAll(jobApplicationId?: number) {
    const params = jobApplicationId ? { jobApplicationId } : {};
    return this.httpClient.get<ApiResponse<IJoiningBookletResponse[]>>(`${this.API_URL}`, { params });
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IJoiningBookletResponse>>(`${this.API_URL}/${id}`);
  }

  generate(request: IJoiningBookletGenerateRequest) {
    return this.httpClient.post<ApiResponse<IJoiningBookletResponse>>(`${this.API_URL}/generate`, request);
  }

  bulkGenerate(request: IJoiningBookletBulkGenerateRequest) {
    return this.httpClient.post<ApiResponse<IJoiningBookletBulkGenerateResponse>>(`${this.API_URL}/bulk-generate`, request);
  }

  bulkDownload(request: IJoiningBookletBulkDownloadRequest) {
    return this.httpClient.post(`${this.API_URL}/bulk-download`, request, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
