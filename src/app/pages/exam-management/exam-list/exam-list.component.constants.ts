import { ExamTypeEnum } from '@app/@core/enums/recruitment.enum';

export const ExamListColumns = [
  { field: 'title', label: 'Title', width: '18rem', sortable: true },
  { field: 'scheduledStartAt', label: 'Scheduled At', width: '12rem', sortable: true },
  { field: 'examType', label: 'Type', width: '8rem', sortable: true },
  { field: 'venue', label: 'Venue / Question Group', width: '14rem', sortable: false },
  { field: 'seatPlan', label: 'Seat Plan', width: '8rem', sortable: false },
];

export const ExamTypeOptions = [
  { label: 'In Person', value: ExamTypeEnum.InPerson },
  { label: 'Online', value: ExamTypeEnum.Online },
];
