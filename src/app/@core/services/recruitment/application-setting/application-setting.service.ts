import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IApplicationSettingResponse, IApplicationSettingUpdateRequest } from '@core/interfaces/recruitment-management/application-setting.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSettingService {
  constructor(private httpClient: HttpClient) {}

  API_URL = `${BASE_URL_Recruitment}/application-settings`;

  getSettings() {
    return this.httpClient.get<ApiResponse<IApplicationSettingResponse>>(this.API_URL);
  }

  updateSettings(request: IApplicationSettingUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(this.API_URL, request);
  }
}
