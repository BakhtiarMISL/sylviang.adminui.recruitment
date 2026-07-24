import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  INotificationTemplateCreateRequest,
  INotificationTemplatePreviewRequest,
  INotificationTemplatePreviewResponse,
  INotificationTemplateResponse,
  INotificationTemplateUpdateRequest,
  INotificationTemplateVersionResponse,
} from '@core/interfaces/recruitment-management/notification-template.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationTemplateService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/notification-template';

  getAll() {
    return this.httpClient.get<ApiResponse<INotificationTemplateResponse[]>>(`${this.API_URL}`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<INotificationTemplateResponse>>(`${this.API_URL}/${id}`);
  }

  getVersions(id: number) {
    return this.httpClient.get<ApiResponse<INotificationTemplateVersionResponse[]>>(`${this.API_URL}/${id}/versions`);
  }

  create(request: INotificationTemplateCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: INotificationTemplateUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  delete(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  preview(request: INotificationTemplatePreviewRequest) {
    return this.httpClient.post<ApiResponse<INotificationTemplatePreviewResponse>>(`${this.API_URL}/preview`, request);
  }
}
