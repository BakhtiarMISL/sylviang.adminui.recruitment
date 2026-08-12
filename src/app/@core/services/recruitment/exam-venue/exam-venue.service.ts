import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IExamVenueLookupResponse,
  IExamVenueRequest,
  IExamVenueResponse,
  ISetActiveStatusRequest,
} from '@core/interfaces/recruitment-management/exam-venue.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ExamVenueService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/exam-venue';

  getAll() {
    return this.httpClient.get<ApiResponse<IExamVenueResponse[]>>(`${this.API_URL}`);
  }

  getLookup() {
    return this.httpClient.get<ApiResponse<IExamVenueLookupResponse[]>>(`${this.API_URL}/lookup`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IExamVenueResponse>>(`${this.API_URL}/${id}`);
  }

  create(request: IExamVenueRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: IExamVenueRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  setActiveStatus(id: number, request: ISetActiveStatusRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${id}/active-status`, request);
  }
}
