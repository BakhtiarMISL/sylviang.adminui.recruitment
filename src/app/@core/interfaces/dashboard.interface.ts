export interface IDashboardSummaryResponse {
  role: string;
  openJobPostingsCount?: number | null;
  totalApplicationsCount?: number | null;
  activeHiringPipelinesCount?: number | null;
  profileCompletenessPercentage?: number | null;
}
