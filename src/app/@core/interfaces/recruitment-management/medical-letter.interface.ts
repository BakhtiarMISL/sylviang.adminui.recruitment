export interface IMedicalLetterGenerateRequest {
  offerLetterId: number;
  documentTemplateId: number;
  medicalTestCenter: string;
  requiredTests: string;
  finalBody: string;
}

export interface IMedicalLetterResponse {
  medicalLetterId: number;
  jobApplicationId: number;
  candidateName: string;
  offerLetterId: number;
  documentTemplateId: number;
  documentTemplateName: string;
  medicalTestCenter: string;
  requiredTests: string;
  finalBody: string;
  generatedPdfPath: string;
  generatedAt: string;
}
