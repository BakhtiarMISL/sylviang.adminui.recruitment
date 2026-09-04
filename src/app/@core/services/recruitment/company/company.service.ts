import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DISABLE_TOAST } from '@core/constants/http-context';
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

  // disableToast: caller sets this when a logo upload will follow and show its own combined
  // toast - otherwise this create toast and that one would stack.
  create(request: ICompanyCreateRequest, disableToast = false) {
    const context = disableToast ? new HttpContext().set(DISABLE_TOAST, true) : undefined;
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request, { context });
  }

  update(id: number, request: ICompanyUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  setActive(id: number, isActive: boolean) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${id}/active`, {}, { params: { isActive } });
  }

  uploadLogo(id: number, file: File, disableToast = false) {
    const formData = new FormData();
    formData.append('file', file);
    const context = disableToast ? new HttpContext().set(DISABLE_TOAST, true) : undefined;
    return this.httpClient.post<ApiResponse<string>>(`${this.API_URL}/${id}/logo`, formData, { context });
  }
}
