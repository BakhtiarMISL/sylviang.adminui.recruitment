import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IImpersonationStartRequest, IImpersonationStartResponse } from '@core/interfaces/recruitment-management/impersonation.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ImpersonationService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/impersonation';

  start(request: IImpersonationStartRequest) {
    return this.httpClient.post<ApiResponse<IImpersonationStartResponse>>(`${this.API_URL}/start`, request);
  }

  end() {
    return this.httpClient.post<ApiResponse<void>>(`${this.API_URL}/end`, {});
  }
}
