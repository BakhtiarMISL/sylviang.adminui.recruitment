import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { ApplicationStatusEnum, EmploymentTypeEnum } from '@core/enums/recruitment.enum';
import { IJobVacancyResponse } from '@core/interfaces/recruitment-management/job-vacancy.interface';
import { IMasterDataItem } from '@core/interfaces/recruitment-management/master-data.interface';
import {
  ICandidateSourceAnalyticsRequest,
  ICandidateSourceAnalyticsResponse,
  IInterviewAnalyticsRequest,
  IInterviewAnalyticsResponse,
  IRecruitmentFunnelRequest,
  IRecruitmentFunnelResponse,
  ITimeToHireRequest,
  ITimeToHireResponse,
} from '@core/interfaces/recruitment-management/analytics.interface';
import { AnalyticsService } from '@core/services/recruitment/analytics/analytics.service';
import { JobVacancyService } from '@core/services/recruitment/job-vacancy/job-vacancy.service';
import { MasterDataService } from '@app/@core/services/recruitment/master-data/master-data.service';
import { saveFileResponse } from '@core/services/recruitment/cv-bank/cv-bank.service';
import { UIChart } from 'primeng/chart';
import { forkJoin } from 'rxjs';

// Display labels for stage-duration chart x-axis - mirrors AnalyticsReportService.FunnelLabels on
// the backend (funnel stage labels come from the API response directly; this is only needed for
// US-107 AC3's breakdown chart, which returns the raw ApplicationStatusEnum with no label).
const STATUS_LABELS: Record<string, string> = {
  [ApplicationStatusEnum.Applied]: 'Applied',
  [ApplicationStatusEnum.Screening]: 'Screened',
  [ApplicationStatusEnum.Shortlisted]: 'Shortlisted',
  [ApplicationStatusEnum.InterviewScheduled]: 'Interview Scheduled',
  [ApplicationStatusEnum.Interviewed]: 'Interviewed',
  [ApplicationStatusEnum.Offered]: 'Offered',
  [ApplicationStatusEnum.Hired]: 'Hired',
};

@Component({
  selector: 'app-recruitment-analytics',
  standalone: false,
  templateUrl: './recruitment-analytics.component.html',
  styleUrl: './recruitment-analytics.component.scss',
})
export class RecruitmentAnalyticsComponent implements OnInit {
  @ViewChild('funnelChart') funnelChartRef?: UIChart;

  constructor(
    private analyticsService: AnalyticsService,
    private jobVacancyService: JobVacancyService,
    private masterDataService: MasterDataService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  vacancyOptions: IJobVacancyResponse[] = [];
  departmentOptions: IMasterDataItem[] = [];
  candidateTypeOptions = [
    { label: 'All', value: null },
    { label: 'Internal', value: true },
    { label: 'External', value: false },
  ];
  employmentTypeOptions = [
    { label: 'All', value: null },
    { label: 'Full Time', value: EmploymentTypeEnum.FullTime },
    { label: 'Part Time', value: EmploymentTypeEnum.PartTime },
    { label: 'Contract', value: EmploymentTypeEnum.Contract },
    { label: 'Internship', value: EmploymentTypeEnum.Internship },
  ];

  loading = false;
  exporting = false;
  errorMessage = '';
  filtersCollapsed = true;

  funnel: IRecruitmentFunnelResponse | null = null;
  timeToHire: ITimeToHireResponse | null = null;
  candidateSourceAnalytics: ICandidateSourceAnalyticsResponse | null = null;
  interviewAnalytics: IInterviewAnalyticsResponse | null = null;

  filterJobPostingId: number | null = null;
  filterDepartmentId: number | null = null;
  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;
  filterIsInternal: boolean | null = null;
  filterEmploymentType: EmploymentTypeEnum | null = null;

  funnelChartData: unknown;
  funnelChartOptions: unknown;
  stageDurationChartData: unknown;
  stageDurationChartOptions: unknown;
  candidateSourceChartData: unknown;
  candidateSourceChartOptions: unknown;
  scoreHistogramChartData: unknown;
  scoreHistogramChartOptions: unknown;

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/analytics/recruitment' },
      { title: 'Recruitment Analytics', icon: 'fa-solid fa-chart-column', href: '/analytics/recruitment' },
    ]);

    this.jobVacancyService.getAllJobVacancies().subscribe({
      next: (response) => {
        this.vacancyOptions = !response.hasError && response.content ? response.content : [];
      },
    });

    this.masterDataService.getAll('department').subscribe({
      next: (response) => {
        this.departmentOptions = !response.hasError && response.content ? response.content : [];
      },
    });

    this.runReport();
  }

  private buildFunnelRequest(): IRecruitmentFunnelRequest {
    return {
      jobPostingId: this.filterJobPostingId ?? undefined,
      departmentId: this.filterDepartmentId ?? undefined,
      dateFrom: this.filterDateFrom ? this.filterDateFrom.toISOString() : undefined,
      dateTo: this.filterDateTo ? this.filterDateTo.toISOString() : undefined,
      isInternal: this.filterIsInternal ?? undefined,
    };
  }

  private buildTimeToHireRequest(): ITimeToHireRequest {
    return {
      jobPostingId: this.filterJobPostingId ?? undefined,
      departmentId: this.filterDepartmentId ?? undefined,
      dateFrom: this.filterDateFrom ? this.filterDateFrom.toISOString() : undefined,
      dateTo: this.filterDateTo ? this.filterDateTo.toISOString() : undefined,
    };
  }

  private buildCandidateSourceRequest(): ICandidateSourceAnalyticsRequest {
    return {
      jobPostingId: this.filterJobPostingId ?? undefined,
      employmentType: this.filterEmploymentType ?? undefined,
      dateFrom: this.filterDateFrom ? this.filterDateFrom.toISOString() : undefined,
      dateTo: this.filterDateTo ? this.filterDateTo.toISOString() : undefined,
    };
  }

  private buildInterviewAnalyticsRequest(): IInterviewAnalyticsRequest {
    return {
      jobPostingId: this.filterJobPostingId ?? undefined,
      departmentId: this.filterDepartmentId ?? undefined,
      dateFrom: this.filterDateFrom ? this.filterDateFrom.toISOString() : undefined,
      dateTo: this.filterDateTo ? this.filterDateTo.toISOString() : undefined,
    };
  }

  runReport(): void {
    this.filtersCollapsed = true;
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      funnel: this.analyticsService.getFunnel(this.buildFunnelRequest()),
      timeToHire: this.analyticsService.getTimeToHire(this.buildTimeToHireRequest()),
      candidateSource: this.analyticsService.getCandidateSourceAnalytics(this.buildCandidateSourceRequest()),
      interviewAnalytics: this.analyticsService.getInterviewAnalytics(this.buildInterviewAnalyticsRequest()),
    }).subscribe({
      next: ({ funnel, timeToHire, candidateSource, interviewAnalytics }) => {
        this.funnel = !funnel.hasError && funnel.content ? funnel.content : null;
        this.timeToHire = !timeToHire.hasError && timeToHire.content ? timeToHire.content : null;
        this.candidateSourceAnalytics = !candidateSource.hasError && candidateSource.content ? candidateSource.content : null;
        this.interviewAnalytics = !interviewAnalytics.hasError && interviewAnalytics.content ? interviewAnalytics.content : null;
        this.buildCharts();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.funnel = null;
        this.timeToHire = null;
        this.candidateSourceAnalytics = null;
        this.interviewAnalytics = null;
        this.errorMessage = error?.error?.decentMessage || 'Failed to load recruitment analytics.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  resetFilters(): void {
    this.filterJobPostingId = null;
    this.filterDepartmentId = null;
    this.filterDateFrom = null;
    this.filterDateTo = null;
    this.filterIsInternal = null;
    this.filterEmploymentType = null;
    // runReport() collapses the panel (Apply-button behavior) - reopen it after, since Reset
    // should leave the now-cleared filters visible rather than hiding them again.
    this.runReport();
    this.filtersCollapsed = false;
  }

  private buildCharts(): void {
    const stages = this.funnel?.stages ?? [];

    this.funnelChartData = {
      labels: stages.map((s) => s.label),
      datasets: [
        {
          label: 'Applications',
          data: stages.map((s) => s.count),
          backgroundColor: '#6366f1',
        },
      ],
    };

    this.funnelChartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: (context: { dataIndex: number }) => {
              const stage = stages[context.dataIndex];
              if (!stage) return '';
              const lines: string[] = [];
              if (stage.conversionFromPreviousPercent != null) {
                lines.push(`Conversion: ${stage.conversionFromPreviousPercent}%`);
              }
              if (stage.droppedCount > 0) {
                lines.push(`Dropped: ${stage.droppedCount}`);
                stage.dropOffReasons.forEach((r) => lines.push(`  ${r.reasonLabel}: ${r.count}`));
              }
              return lines;
            },
          },
        },
      },
      scales: {
        x: { beginAtZero: true, ticks: { stepSize: 1 } },
        // Fixed set of 7 funnel stages - always show every label, never thin them out.
        y: { ticks: { autoSkip: false } },
      },
    };

    const breakdown = this.timeToHire?.stageBreakdown ?? [];

    this.stageDurationChartData = {
      labels: breakdown.map((s) => STATUS_LABELS[s.toStatus] ?? s.toStatus),
      datasets: [
        {
          label: 'Average Days',
          data: breakdown.map((s) => s.averageDays),
          backgroundColor: '#0ea5e9',
        },
      ],
    };

    this.stageDurationChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true }, x: { ticks: { autoSkip: false } } },
    };

    const segments = this.candidateSourceAnalytics?.segments ?? [];
    const segmentColors = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];

    this.candidateSourceChartData = {
      labels: segments.map((s) => s.sourceLabel),
      datasets: [
        {
          data: segments.map((s) => s.totalApplications),
          backgroundColor: segments.map((_, i) => segmentColors[i % segmentColors.length]),
        },
      ],
    };

    this.candidateSourceChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' },
        tooltip: {
          callbacks: {
            afterLabel: (context: { dataIndex: number }) => {
              const segment = segments[context.dataIndex];
              if (!segment) return '';
              return [
                `Shortlisted: ${segment.shortlistedCount}`,
                `Hired: ${segment.hiredCount}`,
                `Conversion: ${segment.conversionRatePercent}%`,
              ];
            },
          },
        },
      },
    };

    const histogram = this.interviewAnalytics?.scoreHistogram ?? [];

    this.scoreHistogramChartData = {
      labels: histogram.map((b) => b.band),
      datasets: [
        {
          label: 'Evaluations',
          data: histogram.map((b) => b.count),
          backgroundColor: '#0ea5e9',
        },
      ],
    };

    this.scoreHistogramChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      // Fixed set of 5 score bands - always show every label, never thin them out.
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { ticks: { autoSkip: false } } },
    };
  }

  exportFunnelPng(): void {
    if (!this.funnelChartRef) return;

    const base64 = this.funnelChartRef.getBase64Image();
    const anchor = document.createElement('a');
    anchor.href = base64;
    anchor.download = 'Recruitment-Funnel.png';
    anchor.click();
  }

  exportFunnelCsv(): void {
    this.exporting = true;
    this.analyticsService.exportFunnelCsv(this.buildFunnelRequest()).subscribe({
      next: (response) => {
        saveFileResponse(response, 'Recruitment-Funnel.csv');
        this.exporting = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.decentMessage || 'Failed to export funnel CSV.';
        this.exporting = false;
        this.cdr.detectChanges();
      },
    });
  }

  exportTimeToHireCsv(): void {
    this.exporting = true;
    this.analyticsService.exportTimeToHireCsv(this.buildTimeToHireRequest()).subscribe({
      next: (response) => {
        saveFileResponse(response, 'Time-To-Hire.csv');
        this.exporting = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.decentMessage || 'Failed to export time-to-hire CSV.';
        this.exporting = false;
        this.cdr.detectChanges();
      },
    });
  }

  exportCandidateSourceExcel(): void {
    this.exporting = true;
    this.analyticsService.exportCandidateSourceAnalyticsExcel(this.buildCandidateSourceRequest()).subscribe({
      next: (response) => {
        saveFileResponse(response, 'Candidate-Source-Analytics.xlsx');
        this.exporting = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.decentMessage || 'Failed to export candidate source analytics.';
        this.exporting = false;
        this.cdr.detectChanges();
      },
    });
  }

  exportInterviewAnalyticsExcel(): void {
    this.exporting = true;
    this.analyticsService.exportInterviewAnalyticsExcel(this.buildInterviewAnalyticsRequest()).subscribe({
      next: (response) => {
        saveFileResponse(response, 'Interview-Analytics.xlsx');
        this.exporting = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.decentMessage || 'Failed to export interview analytics.';
        this.exporting = false;
        this.cdr.detectChanges();
      },
    });
  }
}
