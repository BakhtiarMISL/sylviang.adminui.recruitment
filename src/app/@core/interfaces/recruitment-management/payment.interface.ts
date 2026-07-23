export interface IPaymentInitiateResponse {
  success: boolean;
  gatewayRedirectUrl?: string;
  failureReason?: string;
}

export interface IPaymentStatusResponse {
  jobApplicationId: number;
  applicationStatus: string;
  paymentStatus?: string;
  amount?: number;
  currency?: string;
  paidAt?: string;
}
