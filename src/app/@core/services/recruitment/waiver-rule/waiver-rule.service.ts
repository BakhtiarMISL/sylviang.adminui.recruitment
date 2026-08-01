import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IWaiverRuleRequest, IWaiverRuleResponse } from '@core/interfaces/recruitment-management/waiver-rule.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class WaiverRuleService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/waiver-rule';

  getAll() {
    return this.httpClient.get<ApiResponse<IWaiverRuleResponse[]>>(this.API_URL);
  }

  create(request: IWaiverRuleRequest) {
    return this.httpClient.post<ApiResponse<number>>(this.API_URL, request);
  }

  update(waiverRuleId: number, request: IWaiverRuleRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${waiverRuleId}`, request);
  }

  delete(waiverRuleId: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/${waiverRuleId}`);
  }
}
