import { InterviewStatusEnum } from '@app/@core/enums/recruitment.enum';

export const InterviewListColumns = [
  { field: 'candidateName', label: 'Candidate', width: '16rem', sortable: false },
  { field: 'interviewType', label: 'Type', width: '8rem', sortable: false },
  { field: 'location', label: 'Venue / Meeting Link', width: '16rem', sortable: false },
  { field: 'scheduledStartAt', label: 'Scheduled At', width: '12rem', sortable: true },
  { field: 'round', label: 'Round', width: '6rem', sortable: false },
  { field: 'status', label: 'Status', width: '8rem', sortable: false },
];

export const InterviewStatusOptions = [
  { label: 'Scheduled', value: InterviewStatusEnum.Scheduled },
  { label: 'Rescheduled', value: InterviewStatusEnum.Rescheduled },
  { label: 'Cancelled', value: InterviewStatusEnum.Cancelled },
  { label: 'Completed', value: InterviewStatusEnum.Completed },
  { label: 'No Show', value: InterviewStatusEnum.NoShow },
];
