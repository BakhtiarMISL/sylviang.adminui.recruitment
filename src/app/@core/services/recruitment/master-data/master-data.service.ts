import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IMasterDataItem } from '@core/interfaces/recruitment-management/master-data.interface';
import { BASE_URL_Recruitment } from '@env/environment';

/**
 * One generic CRUD client for every dynamic master-data lookup (Country, EducationBoard, Degree,
 * University, Gender, MaritalStatus, Religion, BloodGroup) - each screen just passes its own
 * apiPath rather than getting its own service class, since the wire shape is identical.
 */
@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  constructor(private httpClient: HttpClient) {}

  getAll(apiPath: string) {
    return this.httpClient.get<ApiResponse<IMasterDataItem[]>>(`${BASE_URL_Recruitment}/${apiPath}`);
  }

  create(apiPath: string, request: IMasterDataItem) {
    return this.httpClient.post<ApiResponse<number>>(`${BASE_URL_Recruitment}/${apiPath}`, request);
  }

  update(apiPath: string, id: number, request: IMasterDataItem) {
    return this.httpClient.put<ApiResponse<void>>(`${BASE_URL_Recruitment}/${apiPath}/${id}`, request);
  }

  delete(apiPath: string, id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${BASE_URL_Recruitment}/${apiPath}/${id}`);
  }
}
