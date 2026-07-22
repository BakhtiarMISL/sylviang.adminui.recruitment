import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import { DISABLE_TOAST } from '@core/constants/http-context';
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

  // POST only because the boolean query/filters need a request body - this is a read/search
  // operation (runs on page load and every page change), not a save, so it must never toast.
  search(request: ICvBankSearchRequest) {
    return this.httpClient.post<ApiResponse<PaginatedResponse<ICvBankSearchResultResponse[]>>>(`${this.API_URL}/search`, request, {
      context: new HttpContext().set(DISABLE_TOAST, true),
    });
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
