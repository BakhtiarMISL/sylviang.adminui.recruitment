import { NotificationChannelEnum } from '@app/@core/enums/recruitment.enum';

export interface INotificationTemplateCreateRequest {
  channel: NotificationChannelEnum;
  code: string;
  name: string;
  subject?: string;
  body: string;
}

export interface INotificationTemplateUpdateRequest {
  name: string;
  subject?: string;
  body: string;
  isActive: boolean;
}

export interface INotificationTemplateResponse {
  notificationTemplateId: number;
  channel: NotificationChannelEnum;
  code: string;
  name: string;
  subject?: string;
  body: string;
  isActive: boolean;
  currentVersionNumber: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface INotificationTemplateVersionResponse {
  notificationTemplateVersionId: number;
  versionNumber: number;
  subject?: string;
  body: string;
  createdAt?: string;
  createdBy?: number;
}

export interface INotificationTemplatePreviewRequest {
  subject?: string;
  body: string;
  placeholderValues: Record<string, string>;
}

export interface INotificationTemplatePreviewResponse {
  renderedSubject?: string;
  renderedBody: string;
  detectedPlaceholders: string[];
}
