import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import {
  ICvBankSearchRequest,
  ICvBankSearchResultResponse,
  ICvBankTalentPoolAddRequest,
  ICvBankTalentPoolAddResponse,
  ICvBankTalentPoolEntryResponse,
} from '@core/interfaces/recruitment-management/cv-bank.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class CvBankService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/cv-bank';

  search(request: ICvBankSearchRequest) {
    return this.httpClient.post<ApiResponse<PaginatedResponse<ICvBankSearchResultResponse[]>>>(`${this.API_URL}/search`, request);
  }

  addToTalentPool(request: ICvBankTalentPoolAddRequest) {
    return this.httpClient.post<ApiResponse<ICvBankTalentPoolAddResponse>>(`${this.API_URL}/talent-pool`, request);
  }

  getTalentPool() {
    return this.httpClient.get<ApiResponse<ICvBankTalentPoolEntryResponse[]>>(`${this.API_URL}/talent-pool`);
  }

  removeFromTalentPool(candidateProfileId: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/talent-pool/${candidateProfileId}`);
  }
}
