import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SHOW_SUCCESS_TOAST } from '@core/constants/http-context';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import { IJobApplicationSubmitRequest, IJobApplicationSubmitResponse, IPublicJobPostingResponse } from '@core/interfaces/recruitment-management/career-portal.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class CareerPortalService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/career-portal';

  getJobPostings(params: any) {
    return this.httpClient.get<ApiResponse<PaginatedResponse<IPublicJobPostingResponse[]>>>(`${this.API_URL}/job-postings`, { params });
  }

  getJobPostingById(id: number) {
    return this.httpClient.get<ApiResponse<IPublicJobPostingResponse>>(`${this.API_URL}/job-postings/${id}`);
  }

  // resume is optional - omitting it tells the backend to reuse whatever resume the candidate
  // already has on file in their profile Documents (JobApplicationService.SubmitAsync), instead
  // of forcing a re-upload of the same file on every application.
  //
  // waiverProofDocument backs a claimed specialCategoryId (e.g. Freedom Fighter) - without it the
  // backend records the category but never waives the fee (JobApplicationService.SubmitAsync).
  apply(jobPostingId: number, request: IJobApplicationSubmitRequest, resume: File | null, waiverProofDocument: File | null = null) {
    const formData = new FormData();
    formData.append('candidateName', request.candidateName);
    formData.append('candidateEmail', request.candidateEmail);
    if (request.candidatePhone) formData.append('candidatePhone', request.candidatePhone);
    if (request.coverLetter) formData.append('coverLetter', request.coverLetter);
    if (request.specialCategoryId) formData.append('specialCategoryId', String(request.specialCategoryId));
    if (request.referralSourceId) formData.append('referralSourceId', String(request.referralSourceId));
    if (resume) formData.append('resume', resume, resume.name);
    if (waiverProofDocument) formData.append('waiverProofDocument', waiverProofDocument, waiverProofDocument.name);
    // No payment happens here for fee-bearing postings (see PaymentRedirectUrl in the response) -
    // a generic "success" toast at this point would tell the candidate they're done when they
    // still owe payment. apply-form.component handles messaging per branch instead.
    return this.httpClient.post<ApiResponse<IJobApplicationSubmitResponse>>(`${this.API_URL}/job-postings/${jobPostingId}/apply`, formData, {
      context: new HttpContext().set(SHOW_SUCCESS_TOAST, false),
    });
  }
}
