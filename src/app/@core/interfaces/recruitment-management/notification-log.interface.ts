import { NotificationChannelEnum, NotificationRecipientTypeEnum, NotificationStatusEnum, RecruitmentEventEnum } from '@app/@core/enums/recruitment.enum';

export interface INotificationLogFilterRequest {
  fromDate?: string;
  toDate?: string;
  channel?: NotificationChannelEnum;
  recruitmentEvent?: RecruitmentEventEnum;
  deliveryStatus?: NotificationStatusEnum;
  page?: number;
  pageSize?: number;
}

export interface INotificationLogResponse {
  notificationLogId: number;
  recruitmentEvent: RecruitmentEventEnum;
  channel: NotificationChannelEnum;
  recipientType: NotificationRecipientTypeEnum;
  recipientAddress: string;
  recipientName: string;
  renderedSubject?: string;
  deliveryStatus: NotificationStatusEnum;
  sentAt?: string;
  failureReason?: string;
  isRead: boolean;
  readAt?: string;
  jobApplicationId?: number;
  createdAt?: string;
}
