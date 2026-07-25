import { OfferLetterStatusEnum } from '@app/@core/enums/recruitment.enum';

export interface IOfferLetterGenerateRequest {
  jobApplicationId: number;
  documentTemplateId: number;
  designation: string;
  offeredSalary: number;
  joiningDate: string;
  reportingManager?: string;
  offerValidityDate?: string;
}

export interface IOfferLetterResponse {
  offerLetterId: number;
  jobApplicationId: number;
  candidateName: string;
  documentTemplateId: number;
  documentTemplateName: string;
  designation: string;
  offeredSalary: number;
  joiningDate: string;
  reportingManager?: string;
  offerValidityDate?: string;
  generatedPdfPath: string;
  status: OfferLetterStatusEnum;
  generatedAt: string;
}
