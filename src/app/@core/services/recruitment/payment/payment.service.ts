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

  /**
   * Opens (or re-opens, after a failed/cancelled attempt) an SSLCommerz checkout session.
   * candidateEmail is the email the applicant typed at apply time - the backend checks it
   * against the application's own record as an ownership proof, since this endpoint is
   * anonymous and jobApplicationId alone is a guessable sequential number.
   */
  initiatePayment(jobApplicationId: number, candidateEmail: string) {
    return this.httpClient.post<ApiResponse<IPaymentInitiateResponse>>(
      `${this.API_URL}/initiate/${jobApplicationId}?candidateEmail=${encodeURIComponent(candidateEmail)}`,
      {},
    );
  }

  /** Polled by the payment-result page until the IPN handler resolves the outcome. Same ownership check as initiatePayment. */
  getPaymentStatus(jobApplicationId: number, candidateEmail: string) {
    return this.httpClient.get<ApiResponse<IPaymentStatusResponse>>(
      `${this.API_URL}/status/${jobApplicationId}?candidateEmail=${encodeURIComponent(candidateEmail)}`,
    );
  }
}
