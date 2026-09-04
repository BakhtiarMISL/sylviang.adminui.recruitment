import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IEventTemplateMappingCreateRequest,
  IEventTemplateMappingResponse,
  IEventTemplateMappingUpdateRequest,
} from '@core/interfaces/recruitment-management/event-template-mapping.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class EventTemplateMappingService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/event-template-mapping';

  getAll() {
    return this.httpClient.get<ApiResponse<IEventTemplateMappingResponse[]>>(`${this.API_URL}`);
  }

  create(request: IEventTemplateMappingCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: IEventTemplateMappingUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  delete(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }
}
