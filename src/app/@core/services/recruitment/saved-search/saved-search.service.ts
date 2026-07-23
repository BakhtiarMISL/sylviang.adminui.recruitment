import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { ISavedSearchCreateRequest, ISavedSearchLookupResponse, ISavedSearchUpdateRequest } from '@core/interfaces/recruitment-management/saved-search.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class SavedSearchService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/saved-search';

  getLookup() {
    return this.httpClient.get<ApiResponse<ISavedSearchLookupResponse[]>>(`${this.API_URL}/lookup`);
  }

  create(request: ISavedSearchCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: ISavedSearchUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  delete(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }
}
