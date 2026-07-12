import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IDashboardSummaryResponse } from '@core/interfaces/dashboard.interface';
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
}
