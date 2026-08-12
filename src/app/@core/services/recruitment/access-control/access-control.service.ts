import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IRoleCreateRequest,
  IRoleResponse,
  IRoleUpdateRequest,
  IUserAccountCreateRequest,
  IUserAccountResponse,
  IUserAccountUpdateRequest,
} from '@core/interfaces/recruitment-management/access-control.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class UserAccountService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/user-accounts';

  getAll() {
    return this.httpClient.get<ApiResponse<IUserAccountResponse[]>>(`${this.API_URL}`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IUserAccountResponse>>(`${this.API_URL}/${id}`);
  }

  create(request: IUserAccountCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: IUserAccountUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  setActive(id: number, isActive: boolean) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.API_URL}/${id}/active`, {}, { params: { isActive } });
  }
}

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/roles';

  getAll() {
    return this.httpClient.get<ApiResponse<IRoleResponse[]>>(`${this.API_URL}`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IRoleResponse>>(`${this.API_URL}/${id}`);
  }

  create(request: IRoleCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}`, request);
  }

  update(id: number, request: IRoleUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${id}`, request);
  }

  delete(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }
}
