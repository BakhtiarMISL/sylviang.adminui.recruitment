import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IOfferLetterGenerateRequest, IOfferLetterResponse } from '@core/interfaces/recruitment-management/offer-letter.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class OfferLetterService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/offer-letter';

  getAll(jobApplicationId?: number) {
    const params = jobApplicationId ? { jobApplicationId } : {};
    return this.httpClient.get<ApiResponse<IOfferLetterResponse[]>>(`${this.API_URL}`, { params });
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IOfferLetterResponse>>(`${this.API_URL}/${id}`);
  }

  generate(request: IOfferLetterGenerateRequest) {
    return this.httpClient.post<ApiResponse<IOfferLetterResponse>>(`${this.API_URL}/generate`, request);
  }
}
