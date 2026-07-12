import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IAccountEmailUpdateRequest, IAccountPasswordChangeRequest, IAccountSettingsResponse } from '@core/interfaces/account-settings.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountSettingsService {
  constructor(private httpClient: HttpClient) {}

  API_URL = `${BASE_URL_Recruitment}/account-settings`;

  getMyAccount() {
    return this.httpClient.get<ApiResponse<IAccountSettingsResponse>>(`${this.API_URL}/me`);
  }

  updateEmail(request: IAccountEmailUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/me/email`, request);
  }

  changePassword(request: IAccountPasswordChangeRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/me/password`, request);
  }

  uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.httpClient.post<ApiResponse<string>>(`${this.API_URL}/me/photo`, formData);
  }

  deletePhoto() {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/me/photo`);
  }
}
