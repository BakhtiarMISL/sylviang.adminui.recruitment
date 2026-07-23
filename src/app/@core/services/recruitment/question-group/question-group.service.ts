import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IQuestionGroupLookupResponse,
  IQuestionGroupRequest,
  IQuestionGroupResponse,
  ISetActiveStatusRequest,
} from '@core/interfaces/recruitment-management/question-group.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class QuestionGroupService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/question-group';

  getAll() {
    return this.httpClient.get<ApiResponse<IQuestionGroupResponse[]>>(`${this.API_URL}`);
  }

  getLookup() {
    return this.httpClient.get<ApiResponse<IQuestionGroupLookupResponse[]>>(`${this.API_URL}/lookup`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IQuestionGroupResponse>>(`${this.API_URL}/${id}`);
  }

  create(request: IQuestionGroupRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: IQuestionGroupRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  setActiveStatus(id: number, request: ISetActiveStatusRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${id}/active-status`, request);
  }
}
