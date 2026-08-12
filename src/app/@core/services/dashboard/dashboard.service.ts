import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IDashboardSummaryResponse, IDashboardWidgetConfigResponse, IDashboardWidgetConfigUpdateRequest } from '@core/interfaces/dashboard.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private httpClient: HttpClient) {}

  API_URL = `${BASE_URL_Recruitment}/dashboard`;

  getSummary() {
    return this.httpClient.get<ApiResponse<IDashboardSummaryResponse>>(`${this.API_URL}/summary`);
  }

  /** EP-14 US-105 AC5 (minimal build): Admin-only full widget-visibility config. */
  getWidgetConfig() {
    return this.httpClient.get<ApiResponse<IDashboardWidgetConfigResponse[]>>(`${this.API_URL}/widget-config/all`);
  }

  updateWidgetVisibility(widgetKey: string, request: IDashboardWidgetConfigUpdateRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/widget-config/${widgetKey}`, request);
  }
}
