import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IJobVacancyAttachmentResponse } from '@core/interfaces/recruitment-management/job-vacancy-attachment.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class JobVacancyAttachmentService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/job-posting';

  upload(jobPostingId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.httpClient.post<ApiResponse<IJobVacancyAttachmentResponse>>(`${this.API_URL}/${jobPostingId}/attachments`, formData);
  }

  list(jobPostingId: number) {
    return this.httpClient.get<ApiResponse<IJobVacancyAttachmentResponse[]>>(`${this.API_URL}/${jobPostingId}/attachments`);
  }

  delete(jobPostingId: number, attachmentId: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/${jobPostingId}/attachments/${attachmentId}`);
  }
}
