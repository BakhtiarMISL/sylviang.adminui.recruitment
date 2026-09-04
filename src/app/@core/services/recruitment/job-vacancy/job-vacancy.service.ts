import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IJobVacancyCreateRequest, IJobVacancyResponse, IJobVacancyUpdateRequest } from '@core/interfaces/recruitment-management/job-vacancy.interface';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class JobVacancyService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/job-posting';

  getJobVacanciesPaginated(params: any) {
    return this.httpClient.get<ApiResponse<PaginatedResponse<IJobVacancyResponse[]>>>(`${this.API_URL}/paged`, { params });
  }

  /** All job postings (unpaginated) - used to populate the ATS dashboard's "Job Posting" filter. */
  getAllJobVacancies() {
    return this.httpClient.get<ApiResponse<IJobVacancyResponse[]>>(`${this.API_URL}`);
  }

  /** EP-15/US-113: postings created by the current user - additive alongside the full list above. */
  getMyPostings() {
    return this.httpClient.get<ApiResponse<IJobVacancyResponse[]>>(`${this.API_URL}/my-postings`);
  }

  getJobVacancyById(id: number) {
    return this.httpClient.get<ApiResponse<IJobVacancyResponse>>(`${this.API_URL}/${id}`);
  }

  addJobVacancy(request: IJobVacancyCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  updateJobVacancy(id: number, request: IJobVacancyUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  deleteJobVacancy(id: number) {
    return this.httpClient.delete(`${this.API_URL}/${id}`);
  }
}
