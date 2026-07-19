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
  IMyApplication,
} from '@core/interfaces/recruitment-management/job-application.interface';
import { IJobApplicationSubmitResponse, IJobEligibilityResponse } from '@core/interfaces/recruitment-management/career-portal.interface';
import { IJobApplicationPipelineProgress, IPipelineStageProgressUpdateRequest } from '@core/interfaces/recruitment-management/pipeline-progress.interface';
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

  /** IDs of every application matching the dashboard filters, unpaginated (US-047 AC5). */
  getDashboardMatchingIds(params: any) {
    return this.httpClient.get<ApiResponse<number[]>>(`${this.API_URL}/dashboard/matching-ids`, { params });
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

  /** HR applies on a candidate's behalf (US-034) - multipart, same shape as the career-portal apply flow. */
  applyOnBehalf(request: {
    jobPostingId: number;
    candidateName: string;
    candidateEmail: string;
    candidatePhone?: string;
    coverLetter?: string;
    resume: File;
  }) {
    const formData = new FormData();
    formData.append('jobPostingId', String(request.jobPostingId));
    formData.append('candidateName', request.candidateName);
    formData.append('candidateEmail', request.candidateEmail);
    if (request.candidatePhone) formData.append('candidatePhone', request.candidatePhone);
    if (request.coverLetter) formData.append('coverLetter', request.coverLetter);
    formData.append('resume', request.resume, request.resume.name);
    return this.httpClient.post<ApiResponse<IJobApplicationSubmitResponse>>(`${this.API_URL}/apply-on-behalf`, formData);
  }

  // ── Candidate Self-Service (US-040) ─────────────────────────────

  getMyApplications() {
    return this.httpClient.get<ApiResponse<IMyApplication[]>>(`${this.API_URL}/my-applications`);
  }

  withdrawMyApplication(jobApplicationId: number) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/my-applications/${jobApplicationId}/withdraw`, {});
  }

  /** Real-time eligibility check for the current candidate against a job posting (US-024 AC2/AC3). */
  checkEligibility(jobPostingId: number) {
    return this.httpClient.get<ApiResponse<IJobEligibilityResponse>>(`${this.API_URL}/job-posting/${jobPostingId}/eligibility`);
  }

  // ── Pipeline Progress Tracker (US-042) ──────────────────────────

  getPipelineProgress(jobApplicationId: number) {
    return this.httpClient.get<ApiResponse<IJobApplicationPipelineProgress>>(`${this.API_URL}/${jobApplicationId}/pipeline-progress`);
  }

  updateStageProgress(jobApplicationId: number, pipelineStageId: number, request: IPipelineStageProgressUpdateRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${jobApplicationId}/pipeline-progress/${pipelineStageId}`, request);
  }
}
