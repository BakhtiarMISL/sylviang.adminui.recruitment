import { ExportFormatEnum, ExportRequestStatusEnum } from '@app/@core/enums/recruitment.enum';
import { IAtsDashboardFilterParams } from '@app/@core/interfaces/recruitment-management/job-application.interface';

export interface IExportRequestCreateRequest {
  filter: IAtsDashboardFilterParams;
  format: ExportFormatEnum;
}

export interface IExportRequestFilterRequest {
  page?: number;
  pageSize?: number;
  status?: ExportRequestStatusEnum;
}

export interface IExportRequestResponse {
  exportRequestId: number;
  exportType: string;
  format: ExportFormatEnum;
  status: ExportRequestStatusEnum;
  requestedByUserName?: string;
  requestedAt: string;
  completedAt?: string;
  expiresAt: string;
  fileName?: string;
  rowCount?: number;
  failureReason?: string;
}
