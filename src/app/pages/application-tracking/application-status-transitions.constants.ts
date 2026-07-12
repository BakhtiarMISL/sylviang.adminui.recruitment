import { ApplicationStatusEnum } from '@app/@core/enums/recruitment.enum';

/**
 * Client-side mirror of the backend's legal transition map (JobApplicationService.LegalStatusTransitions),
 * used only to grey out illegal next-status options in the dropdown. The backend remains the source
 * of truth/enforcement - this is a UX shortcut, not validation.
 */
export const ApplicationStatusTransitions: Record<ApplicationStatusEnum, ApplicationStatusEnum[]> = {
  [ApplicationStatusEnum.Applied]: [ApplicationStatusEnum.Screening, ApplicationStatusEnum.Rejected, ApplicationStatusEnum.Withdrawn],
  [ApplicationStatusEnum.Screening]: [ApplicationStatusEnum.Shortlisted, ApplicationStatusEnum.Rejected, ApplicationStatusEnum.Withdrawn],
  [ApplicationStatusEnum.Shortlisted]: [ApplicationStatusEnum.InterviewScheduled, ApplicationStatusEnum.Rejected, ApplicationStatusEnum.Withdrawn],
  [ApplicationStatusEnum.InterviewScheduled]: [ApplicationStatusEnum.Interviewed, ApplicationStatusEnum.Rejected, ApplicationStatusEnum.Withdrawn],
  [ApplicationStatusEnum.Interviewed]: [ApplicationStatusEnum.Offered, ApplicationStatusEnum.Rejected, ApplicationStatusEnum.Withdrawn],
  [ApplicationStatusEnum.Offered]: [ApplicationStatusEnum.Hired, ApplicationStatusEnum.Rejected, ApplicationStatusEnum.Withdrawn],
  [ApplicationStatusEnum.Hired]: [],
  [ApplicationStatusEnum.Rejected]: [],
  [ApplicationStatusEnum.Withdrawn]: [],
};

export const StatusesRequiringReason: ApplicationStatusEnum[] = [ApplicationStatusEnum.Rejected, ApplicationStatusEnum.Withdrawn];

export const ApplicationStatusOptions = Object.values(ApplicationStatusEnum).map((value) => ({
  label: value.replace(/([a-z])([A-Z])/g, '$1 $2'),
  value,
}));
