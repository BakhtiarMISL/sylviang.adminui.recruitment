import { DocumentTypeEnum } from '@core/enums/recruitment.enum';

export interface IOfficeNoteResponse {
  officeNoteId: number;
  jobApplicationId: number;
  candidateName: string;
  documentTemplateId: number;
  documentTemplateName: string;
  remarks?: string | null;
  enclosuresSummary: string;
  generatedPdfPath: string;
  generatedAt: string;
}

export interface IOfficeNoteGenerateRequest {
  jobApplicationId: number;
  documentTemplateId: number;
  remarks?: string | null;
}

export interface IOfficeNoteEnclosureItemResponse {
  documentType: DocumentTypeEnum;
  exists: boolean;
  generatedAt?: string | null;
}

export interface IOfficeNoteEnclosuresResponse {
  enclosures: IOfficeNoteEnclosureItemResponse[];
}
