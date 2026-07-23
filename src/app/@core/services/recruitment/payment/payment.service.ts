import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IPaymentInitiateResponse, IPaymentStatusResponse } from '@core/interfaces/recruitment-management/payment.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/payment';

  /** Opens (or re-opens, after a failed/cancelled attempt) an SSLCommerz checkout session. */
  initiatePayment(jobApplicationId: number) {
    return this.httpClient.post<ApiResponse<IPaymentInitiateResponse>>(`${this.API_URL}/initiate/${jobApplicationId}`, {});
  }

  /** Polled by the payment-result page until the IPN handler resolves the outcome. */
  getPaymentStatus(jobApplicationId: number) {
    return this.httpClient.get<ApiResponse<IPaymentStatusResponse>>(`${this.API_URL}/status/${jobApplicationId}`);
  }
}
