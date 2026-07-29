import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import { IJobApplicationSubmitRequest, IJobApplicationSubmitResponse, IPublicJobPostingResponse } from '@core/interfaces/recruitment-management/career-portal.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class InternalJobBoardService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/internal-job-board';

  getJobPostings(params: any) {
    return this.httpClient.get<ApiResponse<PaginatedResponse<IPublicJobPostingResponse[]>>>(`${this.API_URL}/job-postings`, { params });
  }

  getJobPostingById(id: number) {
    return this.httpClient.get<ApiResponse<IPublicJobPostingResponse>>(`${this.API_URL}/job-postings/${id}`);
  }

  apply(jobPostingId: number, request: IJobApplicationSubmitRequest, resume: File) {
    const formData = new FormData();
    formData.append('candidateName', request.candidateName);
    formData.append('candidateEmail', request.candidateEmail);
    if (request.candidatePhone) formData.append('candidatePhone', request.candidatePhone);
    if (request.coverLetter) formData.append('coverLetter', request.coverLetter);
    if (request.specialCategoryId) formData.append('specialCategoryId', String(request.specialCategoryId));
    if (request.referralSourceId) formData.append('referralSourceId', String(request.referralSourceId));
    formData.append('resume', resume, resume.name);
    return this.httpClient.post<ApiResponse<IJobApplicationSubmitResponse>>(`${this.API_URL}/job-postings/${jobPostingId}/apply`, formData);
  }
}
