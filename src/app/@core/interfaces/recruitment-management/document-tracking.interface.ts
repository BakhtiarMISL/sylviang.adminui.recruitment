import { DocumentAcceptanceStatusEnum, DocumentTypeEnum } from '@app/@core/enums/recruitment.enum';

export interface IDocumentTrackingFilterRequest {
  documentType?: DocumentTypeEnum;
  acceptanceStatus?: DocumentAcceptanceStatusEnum;
  page?: number;
  pageSize?: number;
}

export interface IDocumentTrackingItemResponse {
  documentType: DocumentTypeEnum;
  sourceId: number;
  jobApplicationId: number;
  recipientName: string;
  recipientEmail?: string;
  generatedAt: string;
  acceptanceStatus: DocumentAcceptanceStatusEnum;
}
