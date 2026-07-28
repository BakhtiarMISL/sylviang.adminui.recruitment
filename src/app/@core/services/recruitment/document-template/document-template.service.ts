import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IDocumentTemplateCreateRequest,
  IDocumentTemplatePreviewRequest,
  IDocumentTemplatePreviewResponse,
  IDocumentTemplateResponse,
  IDocumentTemplateUpdateRequest,
  IDocumentTemplateVersionResponse,
} from '@core/interfaces/recruitment-management/document-template.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class DocumentTemplateService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/document-template';

  getAll() {
    return this.httpClient.get<ApiResponse<IDocumentTemplateResponse[]>>(`${this.API_URL}`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IDocumentTemplateResponse>>(`${this.API_URL}/${id}`);
  }

  getVersions(id: number) {
    return this.httpClient.get<ApiResponse<IDocumentTemplateVersionResponse[]>>(`${this.API_URL}/${id}/versions`);
  }

  create(request: IDocumentTemplateCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: IDocumentTemplateUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  delete(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  preview(request: IDocumentTemplatePreviewRequest) {
    return this.httpClient.post<ApiResponse<IDocumentTemplatePreviewResponse>>(`${this.API_URL}/preview`, request);
  }
}
