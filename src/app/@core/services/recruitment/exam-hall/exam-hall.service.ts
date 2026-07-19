import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IExamHallLookupResponse,
  IExamHallRequest,
  IExamHallResponse,
  ISetActiveStatusRequest,
} from '@core/interfaces/recruitment-management/exam-hall.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ExamHallService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/exam-hall';

  getAll() {
    return this.httpClient.get<ApiResponse<IExamHallResponse[]>>(`${this.API_URL}`);
  }

  getLookup() {
    return this.httpClient.get<ApiResponse<IExamHallLookupResponse[]>>(`${this.API_URL}/lookup`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IExamHallResponse>>(`${this.API_URL}/${id}`);
  }

  create(request: IExamHallRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: IExamHallRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  setActiveStatus(id: number, request: ISetActiveStatusRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${id}/active-status`, request);
  }
}
