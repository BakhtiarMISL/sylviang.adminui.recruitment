import { NotificationChannelEnum, NotificationRecipientTypeEnum, RecruitmentEventEnum } from '@app/@core/enums/recruitment.enum';

export interface IEventTemplateMappingCreateRequest {
  recruitmentEvent: RecruitmentEventEnum;
  channel: NotificationChannelEnum;
  recipientType: NotificationRecipientTypeEnum;
  notificationTemplateId: number;
}

export interface IEventTemplateMappingUpdateRequest {
  notificationTemplateId: number;
  isActive: boolean;
}

export interface IEventTemplateMappingResponse {
  eventTemplateMappingId: number;
  recruitmentEvent: RecruitmentEventEnum;
  channel: NotificationChannelEnum;
  recipientType: NotificationRecipientTypeEnum;
  notificationTemplateId: number;
  notificationTemplateName: string;
  isActive: boolean;
}
