import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import { DocumentTypeEnum } from '@core/enums/recruitment.enum';
import {
  IDocumentTrackingFilterRequest,
  IDocumentTrackingItemResponse,
} from '@core/interfaces/recruitment-management/document-tracking.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class DocumentTrackingService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/document-tracking';

  getAll(filter: IDocumentTrackingFilterRequest) {
    return this.httpClient.get<ApiResponse<PaginatedResponse<IDocumentTrackingItemResponse[]>>>(`${this.API_URL}`, {
      params: this.buildParams(filter),
    });
  }

  followUp(documentType: DocumentTypeEnum, sourceId: number) {
    return this.httpClient.post<ApiResponse<void>>(`${this.API_URL}/${documentType}/${sourceId}/follow-up`, {});
  }

  private buildParams(filter: IDocumentTrackingFilterRequest): HttpParams {
    let params = new HttpParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
