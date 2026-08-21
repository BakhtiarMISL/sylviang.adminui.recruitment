import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IEffectiveProfileFieldResponse,
  IProfileFieldConfigRequest,
  IProfileFieldConfigResponse,
} from '@core/interfaces/recruitment-management/profile-field-config.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileFieldConfigService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/profile-field-config';

  getAll() {
    return this.httpClient.get<ApiResponse<IProfileFieldConfigResponse[]>>(`${this.API_URL}`);
  }

  getEffective(jobPostingId: number | null) {
    const params = jobPostingId ? { jobPostingId } : {};
    return this.httpClient.get<ApiResponse<IEffectiveProfileFieldResponse[]>>(`${this.API_URL}/effective`, { params });
  }

  create(request: IProfileFieldConfigRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: IProfileFieldConfigRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  delete(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }
}
