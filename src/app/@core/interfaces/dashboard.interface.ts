export interface IDashboardMetric {
  count: number;
  changePercent?: number | null;
  changePeriod: string;
}

export interface IDashboardSummaryResponse {
  role: string;
  openJobPostingsCount?: number | null;
  totalApplicationsCount?: number | null;
  totalApplicationsTrend?: IDashboardMetric | null;
  totalApplicationsByStatus?: Record<string, number> | null;
  activeHiringPipelinesCount?: number | null;
  upcomingInterviewsCount?: number | null;
  pendingApprovalsCount?: number | null;
  offersPendingAcceptanceCount?: number | null;
  visibleWidgetKeys?: string[] | null;
  profileCompletenessPercentage?: number | null;
}

export interface IDashboardWidgetConfigResponse {
  widgetKey: string;
  isVisibleForAdmin: boolean;
  isVisibleForHR: boolean;
}

export interface IDashboardWidgetConfigUpdateRequest {
  isVisibleForAdmin: boolean;
  isVisibleForHR: boolean;
}
