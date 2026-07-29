import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IRecruitmentFunnelRequest,
  IRecruitmentFunnelResponse,
  ITimeToHireRequest,
  ITimeToHireResponse,
} from '@core/interfaces/recruitment-management/analytics.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/analytics';

  getFunnel(request: IRecruitmentFunnelRequest) {
    return this.httpClient.get<ApiResponse<IRecruitmentFunnelResponse>>(`${this.API_URL}/funnel`, {
      params: this.buildParams(request),
    });
  }

  exportFunnelCsv(request: IRecruitmentFunnelRequest) {
    return this.httpClient.get(`${this.API_URL}/funnel/export`, {
      params: this.buildParams(request),
      responseType: 'blob',
      observe: 'response',
    });
  }

  getTimeToHire(request: ITimeToHireRequest) {
    return this.httpClient.get<ApiResponse<ITimeToHireResponse>>(`${this.API_URL}/time-to-hire`, {
      params: this.buildParams(request),
    });
  }

  exportTimeToHireCsv(request: ITimeToHireRequest) {
    return this.httpClient.get(`${this.API_URL}/time-to-hire/export`, {
      params: this.buildParams(request),
      responseType: 'blob',
      observe: 'response',
    });
  }

  private buildParams<T extends object>(filter: T): HttpParams {
    let params = new HttpParams();
    Object.entries(filter as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
