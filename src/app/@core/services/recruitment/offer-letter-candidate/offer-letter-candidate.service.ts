import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IOfferLetterDeclineRequest, IOfferLetterResponse } from '@core/interfaces/recruitment-management/offer-letter.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class OfferLetterCandidateService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/me/offer-letter';

  getAll() {
    return this.httpClient.get<ApiResponse<IOfferLetterResponse[]>>(`${this.API_URL}`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IOfferLetterResponse>>(`${this.API_URL}/${id}`);
  }

  accept(id: number) {
    return this.httpClient.post<ApiResponse<IOfferLetterResponse>>(`${this.API_URL}/${id}/accept`, {});
  }

  decline(id: number, request: IOfferLetterDeclineRequest) {
    return this.httpClient.post<ApiResponse<IOfferLetterResponse>>(`${this.API_URL}/${id}/decline`, request);
  }
}
