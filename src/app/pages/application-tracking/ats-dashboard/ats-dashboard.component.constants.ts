export const AtsDashboardColumns = [
  { field: 'candidateName', label: 'Candidate Name', width: '14rem', sortable: true },
  { field: 'jobPostingTitle', label: 'Job Title', width: '14rem', sortable: false },
  { field: 'source', label: 'Source', width: '8rem', sortable: true },
  { field: 'appliedDate', label: 'Application Date', width: '10rem', sortable: true },
  { field: 'applicationStatus', label: 'Current Status', width: '10rem', sortable: true },
  // EP-14 US-109 AC1/AC3
  { field: 'currentStageName', label: 'Stage', width: '12rem', sortable: true },
  { field: 'lastUpdatedAt', label: 'Last Updated', width: '10rem', sortable: true },
  { field: 'daysInCurrentStage', label: 'Days in Stage', width: '8rem', sortable: true },
  { field: 'assignedHrUserName', label: 'Assigned HR', width: '10rem', sortable: true },
];
