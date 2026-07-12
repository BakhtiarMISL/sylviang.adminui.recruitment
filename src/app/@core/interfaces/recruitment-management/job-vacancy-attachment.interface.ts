export interface IJobVacancyAttachmentResponse {
  jobPostingAttachmentId: number;
  jobPostingId: number;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  downloadUrl: string;
}
