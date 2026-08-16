import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { ICompanyCreateRequest, ICompanyResponse, ICompanyUpdateRequest } from '@core/interfaces/recruitment-management/company.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/companies';

  getAll() {
    return this.httpClient.get<ApiResponse<ICompanyResponse[]>>(`${this.API_URL}`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<ICompanyResponse>>(`${this.API_URL}/${id}`);
  }

  create(request: ICompanyCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: ICompanyUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  setActive(id: number, isActive: boolean) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${id}/active`, {}, { params: { isActive } });
  }

  uploadLogo(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<ApiResponse<string>>(`${this.API_URL}/${id}/logo`, formData);
  }
}
