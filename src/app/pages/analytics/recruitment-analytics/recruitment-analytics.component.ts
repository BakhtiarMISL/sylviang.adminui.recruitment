import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { ApplicationStatusEnum } from '@core/enums/recruitment.enum';
import { IJobVacancyResponse } from '@core/interfaces/recruitment-management/job-vacancy.interface';
import {
  IRecruitmentFunnelRequest,
  IRecruitmentFunnelResponse,
  ITimeToHireRequest,
  ITimeToHireResponse,
} from '@core/interfaces/recruitment-management/analytics.interface';
import { AnalyticsService } from '@core/services/recruitment/analytics/analytics.service';
import { JobVacancyService } from '@core/services/recruitment/job-vacancy/job-vacancy.service';
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
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  vacancyOptions: IJobVacancyResponse[] = [];
  candidateTypeOptions = [
    { label: 'All', value: null },
    { label: 'Internal', value: true },
    { label: 'External', value: false },
  ];

  loading = false;
  exporting = false;
  errorMessage = '';

  funnel: IRecruitmentFunnelResponse | null = null;
  timeToHire: ITimeToHireResponse | null = null;

  filterJobPostingId: number | null = null;
  filterDepartmentId: number | null = null;
  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;
  filterIsInternal: boolean | null = null;

  funnelChartData: unknown;
  funnelChartOptions: unknown;
  stageDurationChartData: unknown;
  stageDurationChartOptions: unknown;

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

  runReport(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      funnel: this.analyticsService.getFunnel(this.buildFunnelRequest()),
      timeToHire: this.analyticsService.getTimeToHire(this.buildTimeToHireRequest()),
    }).subscribe({
      next: ({ funnel, timeToHire }) => {
        this.funnel = !funnel.hasError && funnel.content ? funnel.content : null;
        this.timeToHire = !timeToHire.hasError && timeToHire.content ? timeToHire.content : null;
        this.buildCharts();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.funnel = null;
        this.timeToHire = null;
        this.errorMessage = error?.error?.decentMessage || 'Failed to load recruitment analytics.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
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
}
