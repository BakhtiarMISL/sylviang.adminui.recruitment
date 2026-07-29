import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IMedicalLetterGenerateRequest, IMedicalLetterResponse } from '@core/interfaces/recruitment-management/medical-letter.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class MedicalLetterService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/medical-letter';

  getAll(jobApplicationId?: number) {
    const params = jobApplicationId ? { jobApplicationId } : {};
    return this.httpClient.get<ApiResponse<IMedicalLetterResponse[]>>(`${this.API_URL}`, { params });
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IMedicalLetterResponse>>(`${this.API_URL}/${id}`);
  }

  generate(request: IMedicalLetterGenerateRequest) {
    return this.httpClient.post<ApiResponse<IMedicalLetterResponse>>(`${this.API_URL}/generate`, request);
  }
}
