import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  IPaymentTransactionFilterRequest,
  IPaymentTransactionListResponse,
  IReconciliationRequest,
  IReconciliationResponse,
} from '@core/interfaces/recruitment-management/payment-report.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentReportService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/payment-report';

  getTransactions(filter: IPaymentTransactionFilterRequest) {
    return this.httpClient.get<ApiResponse<IPaymentTransactionListResponse>>(`${this.API_URL}/transactions`, {
      params: this.buildParams(filter),
    });
  }

  getReconciliation(request: IReconciliationRequest) {
    return this.httpClient.get<ApiResponse<IReconciliationResponse>>(`${this.API_URL}/reconciliation`, {
      params: this.buildParams(request),
    });
  }

  exportReconciliation(request: IReconciliationRequest, format: 'xlsx' | 'pdf') {
    return this.httpClient.get(`${this.API_URL}/reconciliation/export`, {
      params: this.buildParams({ ...request, format }),
      responseType: 'blob',
      observe: 'response',
    });
  }

  private buildParams<T extends object>(filter: T): HttpParams {
    let params = new HttpParams();
    Object.entries(filter as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
