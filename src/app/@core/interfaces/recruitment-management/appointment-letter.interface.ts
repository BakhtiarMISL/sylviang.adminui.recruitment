export interface IAppointmentLetterGenerateRequest {
  offerLetterId: number;
  documentTemplateId: number;
  finalBody: string;
}

export interface IAppointmentLetterResponse {
  appointmentLetterId: number;
  jobApplicationId: number;
  candidateName: string;
  offerLetterId: number;
  documentTemplateId: number;
  documentTemplateName: string;
  finalBody: string;
  generatedPdfPath: string;
  generatedAt: string;
}
