import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import {
  IExamQuestionBulkImportResponse,
  IExamQuestionCreateRequest,
  IExamQuestionResponse,
  IExamQuestionUpdateRequest,
} from '@core/interfaces/recruitment-management/exam-question.interface';
import { ISetActiveStatusRequest } from '@core/interfaces/recruitment-management/question-group.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ExamQuestionService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/exam-question';

  getPaged(params: any) {
    return this.httpClient.get<ApiResponse<PaginatedResponse<IExamQuestionResponse[]>>>(`${this.API_URL}/paged`, { params });
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IExamQuestionResponse>>(`${this.API_URL}/${id}`);
  }

  create(request: IExamQuestionCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: IExamQuestionUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  setActiveStatus(id: number, request: ISetActiveStatusRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${id}/active-status`, request);
  }

  /** Raw XLSX bytes (US-054 AC1) - not ApiResponse-wrapped, the endpoint returns a binary file. */
  downloadImportTemplate() {
    return this.httpClient.get(`${this.API_URL}/import-template`, { responseType: 'blob' });
  }

  bulkImport(questionGroupId: number, file: File) {
    const formData = new FormData();
    formData.append('questionGroupId', questionGroupId.toString());
    formData.append('file', file, file.name);
    return this.httpClient.post<ApiResponse<IExamQuestionBulkImportResponse>>(`${this.API_URL}/bulk-import`, formData);
  }
}
