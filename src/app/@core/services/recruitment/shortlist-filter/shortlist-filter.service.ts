import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IShortlistFilterCreateRequest,
  IShortlistFilterLookupResponse,
  IShortlistFilterPreviewRequest,
  IShortlistFilterPreviewResponse,
  IShortlistFilterResponse,
  IShortlistFilterUpdateRequest,
} from '@core/interfaces/recruitment-management/shortlist-filter.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ShortlistFilterService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/shortlist-filter';

  getAll() {
    return this.httpClient.get<ApiResponse<IShortlistFilterResponse[]>>(`${this.API_URL}`);
  }

  getLookup() {
    return this.httpClient.get<ApiResponse<IShortlistFilterLookupResponse[]>>(`${this.API_URL}/lookup`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IShortlistFilterResponse>>(`${this.API_URL}/${id}`);
  }

  create(request: IShortlistFilterCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: IShortlistFilterUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  delete(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  preview(request: IShortlistFilterPreviewRequest) {
    return this.httpClient.post<ApiResponse<IShortlistFilterPreviewResponse>>(`${this.API_URL}/preview`, request);
  }
}
