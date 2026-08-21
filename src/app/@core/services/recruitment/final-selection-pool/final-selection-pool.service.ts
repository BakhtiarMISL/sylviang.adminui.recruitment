import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IFinalSelectionPoolResponse, IFinalSelectionPoolUpdateBatchRequest } from '@core/interfaces/recruitment-management/final-selection-pool.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class FinalSelectionPoolService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/final-selection-pool';

  getAll() {
    return this.httpClient.get<ApiResponse<IFinalSelectionPoolResponse[]>>(`${this.API_URL}`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IFinalSelectionPoolResponse>>(`${this.API_URL}/${id}`);
  }

  markHasJoined(id: number) {
    return this.httpClient.post<ApiResponse<IFinalSelectionPoolResponse>>(`${this.API_URL}/${id}/mark-joined`, {});
  }

  updateBatch(id: number, request: IFinalSelectionPoolUpdateBatchRequest) {
    return this.httpClient.put<ApiResponse<IFinalSelectionPoolResponse>>(`${this.API_URL}/${id}/batch`, request);
  }
}
