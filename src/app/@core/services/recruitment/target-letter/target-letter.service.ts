import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { ITargetLetterGenerateRequest, ITargetLetterResponse } from '@core/interfaces/recruitment-management/target-letter.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class TargetLetterService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/target-letter';

  getAll(jobApplicationId?: number) {
    const params = jobApplicationId ? { jobApplicationId } : {};
    return this.httpClient.get<ApiResponse<ITargetLetterResponse[]>>(`${this.API_URL}`, { params });
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<ITargetLetterResponse>>(`${this.API_URL}/${id}`);
  }

  generate(request: ITargetLetterGenerateRequest) {
    return this.httpClient.post<ApiResponse<ITargetLetterResponse>>(`${this.API_URL}/generate`, request);
  }
}
