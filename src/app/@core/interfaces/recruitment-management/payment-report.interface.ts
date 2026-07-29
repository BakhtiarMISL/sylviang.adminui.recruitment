export enum PaymentTransactionStatusEnum {
  Pending = 'Pending',
  Initiated = 'Initiated',
  Success = 'Success',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
}

export interface IPaymentTransactionFilterRequest {
  jobPostingId?: number | null;
  paymentStatus?: PaymentTransactionStatusEnum | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  page?: number;
  pageSize?: number;
}

export interface IPaymentTransactionListItem {
  paymentId: number;
  jobApplicationId: number;
  candidateName: string;
  candidateEmail?: string | null;
  vacancyTitle: string;
  paymentMethod: string;
  paymentStatus: PaymentTransactionStatusEnum;
  amount: number;
  currency: string;
  transactionId: string;
  paidAt?: string | null;
}

export interface IPaymentTransactionListResponse {
  data: IPaymentTransactionListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalAmount: number;
}

export interface IReconciliationRequest {
  dateFrom: string;
  dateTo: string;
  jobPostingId?: number | null;
  departmentId?: number | null;
  siteId?: number | null;
}

export interface IReconciliationResponse {
  dateFrom: string;
  dateTo: string;
  paidCount: number;
  paidAmount: number;
  failedCount: number;
  waivedCount: number;
  netAmount: number;
}
