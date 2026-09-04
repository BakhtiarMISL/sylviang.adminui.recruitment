import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import { DISABLE_TOAST } from '@core/constants/http-context';
import {
  ICvBankCvBulkRequest,
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

  // Same reasoning as TalentPoolService.addCandidates - caller renders its own precise
  // addedCount/alreadyInPoolCount message, the generic success toast would be redundant/misleading.
  addToTalentPool(request: ICvBankTalentPoolAddRequest) {
    return this.httpClient.post<ApiResponse<ICvBankTalentPoolAddResponse>>(`${this.API_URL}/talent-pool`, request, {
      context: new HttpContext().set(DISABLE_TOAST, true),
    });
  }

  getTalentPool() {
    return this.httpClient.get<ApiResponse<ICvBankTalentPoolEntryResponse[]>>(`${this.API_URL}/talent-pool`);
  }

  removeFromTalentPool(candidateProfileId: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/talent-pool/${candidateProfileId}`);
  }

  // Standardized CV, generated from the candidate's profile data - not their uploaded resume file.
  downloadCv(candidateProfileId: number) {
    return this.httpClient.get(`${this.API_URL}/${candidateProfileId}/cv/download`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  bulkDownloadCv(request: ICvBankCvBulkRequest) {
    return this.httpClient.post(`${this.API_URL}/cv/bulk-download`, request, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  bulkExportExcel(request: ICvBankCvBulkRequest) {
    return this.httpClient.post(`${this.API_URL}/cv/bulk-export-excel`, request, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}

/** Saves a blob HttpResponse to disk using its Content-Disposition filename, falling back to `fallbackFileName`. */
export function saveFileResponse(response: HttpResponse<Blob>, fallbackFileName: string): void {
  const contentDisposition = response.headers.get('content-disposition') || '';
  const match = /filename="?([^";]+)"?/i.exec(contentDisposition);
  const fileName = match ? match[1] : fallbackFileName;

  const url = window.URL.createObjectURL(response.body as Blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
