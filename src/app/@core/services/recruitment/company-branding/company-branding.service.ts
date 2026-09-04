import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { ICompanyBrandingResponse, ICompanyBrandingUpdateRequest } from '@core/interfaces/recruitment-management/company-branding.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyBrandingService {
  constructor(private httpClient: HttpClient) {}

  API_URL = `${BASE_URL_Recruitment}/company-branding`;

  getSettings() {
    return this.httpClient.get<ApiResponse<ICompanyBrandingResponse>>(this.API_URL);
  }

  updateSettings(request: ICompanyBrandingUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(this.API_URL, request);
  }

  uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.httpClient.post<ApiResponse<string>>(`${this.API_URL}/logo`, formData);
  }

  // EP-18 F3: sample PDF reflecting the given (possibly unsaved) settings, so "Preview PDF" can
  // show draft edits before Save - same blob/observe-response shape as every other PDF download.
  previewPdf(request: ICompanyBrandingUpdateRequest) {
    return this.httpClient.post(`${this.API_URL}/preview/pdf`, request, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
