import { DocumentTypeEnum } from '@app/@core/enums/recruitment.enum';

export interface IDocumentTemplateCreateRequest {
  documentType: DocumentTypeEnum;
  code: string;
  name: string;
  body: string;
}

export interface IDocumentTemplateUpdateRequest {
  name: string;
  body: string;
  isActive: boolean;
}

export interface IDocumentTemplateResponse {
  documentTemplateId: number;
  documentType: DocumentTypeEnum;
  code: string;
  name: string;
  body: string;
  isActive: boolean;
  currentVersionNumber: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IDocumentTemplateVersionResponse {
  documentTemplateVersionId: number;
  versionNumber: number;
  body: string;
  createdAt?: string;
  createdBy?: number;
}

export interface IDocumentTemplatePreviewRequest {
  body: string;
  placeholderValues: Record<string, string>;
}

export interface IDocumentTemplatePreviewResponse {
  renderedBody: string;
  detectedPlaceholders: string[];
}
