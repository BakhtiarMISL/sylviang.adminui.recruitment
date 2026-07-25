import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IScorecardLookupResponse,
  IScorecardRequest,
  IScorecardResponse,
} from '@core/interfaces/recruitment-management/scorecard.interface';
import { ISetActiveStatusRequest } from '@core/interfaces/recruitment-management/exam-venue.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ScorecardService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/scorecard';

  getAll() {
    return this.httpClient.get<ApiResponse<IScorecardResponse[]>>(`${this.API_URL}`);
  }

  getLookup() {
    return this.httpClient.get<ApiResponse<IScorecardLookupResponse[]>>(`${this.API_URL}/lookup`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IScorecardResponse>>(`${this.API_URL}/${id}`);
  }

  create(request: IScorecardRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: IScorecardRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  setActiveStatus(id: number, request: ISetActiveStatusRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${id}/active-status`, request);
  }
}
