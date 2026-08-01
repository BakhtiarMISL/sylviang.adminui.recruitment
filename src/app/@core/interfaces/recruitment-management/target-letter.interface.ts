export interface ITargetLetterGenerateRequest {
  offerLetterId: number;
  documentTemplateId: number;
  kpis: string;
  objectives: string;
  finalBody: string;
}

export interface ITargetLetterResponse {
  targetLetterId: number;
  jobApplicationId: number;
  candidateName: string;
  offerLetterId: number;
  documentTemplateId: number;
  documentTemplateName: string;
  kpis: string;
  objectives: string;
  finalBody: string;
  generatedPdfPath: string;
  generatedAt: string;
}
