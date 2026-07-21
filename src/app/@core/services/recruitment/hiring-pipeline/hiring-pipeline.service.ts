import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IHiringPipelineCreateRequest,
  IHiringPipelineLookupResponse,
  IHiringPipelineResponse,
  IHiringPipelineUpdateRequest,
} from '@core/interfaces/recruitment-management/hiring-pipeline.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class HiringPipelineService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/hiring-pipeline';

  getAll() {
    return this.httpClient.get<ApiResponse<IHiringPipelineResponse[]>>(`${this.API_URL}`);
  }

  getActiveLookup() {
    return this.httpClient.get<ApiResponse<IHiringPipelineLookupResponse[]>>(`${this.API_URL}/active-lookup`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IHiringPipelineResponse>>(`${this.API_URL}/${id}`);
  }

  create(request: IHiringPipelineCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: IHiringPipelineUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  delete(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  duplicate(id: number) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}/${id}/duplicate`, {});
  }

  setActive(id: number, isActive: boolean) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${id}/active`, {}, { params: { isActive } });
  }
}
