export interface IJoiningBookletEligibleCandidateResponse {
  offerLetterId: number;
  jobApplicationId: number;
  candidateName: string;
  designation: string;
  offerJoiningDate: string;
}

export interface IJoiningBookletGenerateRequest {
  offerLetterId: number;
  documentTemplateId: number;
  batchLabel: string;
  joiningDate: string;
}

export interface IJoiningBookletBulkGenerateRequest {
  offerLetterIds: number[];
  documentTemplateId: number;
  batchLabel: string;
  joiningDate: string;
}

export interface IJoiningBookletBulkDownloadRequest {
  joiningBookletIds: number[];
}

export interface IJoiningBookletResponse {
  joiningBookletId: number;
  jobApplicationId: number;
  candidateName: string;
  offerLetterId: number;
  documentTemplateId: number;
  documentTemplateName: string;
  batchLabel: string;
  joiningDate: string;
  renderedBody: string;
  generatedPdfPath: string;
  generatedAt: string;
}

export interface IJoiningBookletBulkItemResult {
  offerLetterId: number;
  success: boolean;
  joiningBookletId?: number;
  errorMessage?: string;
}

export interface IJoiningBookletBulkGenerateResponse {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  results: IJoiningBookletBulkItemResult[];
}
