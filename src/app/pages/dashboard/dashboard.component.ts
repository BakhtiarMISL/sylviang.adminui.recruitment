import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/@core/services/auth/auth.service';
import { DashboardService } from '@app/@core/services/dashboard/dashboard.service';
import { UserRoleEnum } from '@app/@core/enums/user-role.enum';
import { IDashboardSummaryResponse, IDashboardWidgetConfigResponse } from '@app/@core/interfaces/dashboard.interface';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { interval, startWith } from 'rxjs';

/** US-105 AC4: auto-refresh every 5 minutes, plus a manual reload button. */
const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

interface IDashboardWidget {
  key: string;
  icon: string;
  label: string;
  getValue: (summary: IDashboardSummaryResponse) => number;
  getTrendPercent?: (summary: IDashboardSummaryResponse) => number | null | undefined;
  navigate: () => (string | number)[];
  queryParams?: Record<string, string>;
}

@UntilDestroy()
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router,
  ) {}

  currentYear = new Date().getFullYear();
  readonly UserRoleEnum = UserRoleEnum;

  loading = true;
  summary: IDashboardSummaryResponse | null = null;

  // US-105 AC5 (minimal build ahead of full EP-15 access control): Admin-only widget-visibility toggle.
  widgetConfigs: IDashboardWidgetConfigResponse[] = [];
  widgetConfigLoading = false;
  widgetConfigSaving: string | null = null;

  readonly widgets: IDashboardWidget[] = [
    {
      key: 'OpenVacancies',
      icon: 'fa-solid fa-briefcase',
      label: 'Open Job Postings',
      getValue: (s) => s.openJobPostingsCount ?? 0,
      navigate: () => ['/job-vacancy/job-vacancy-list'],
    },
    {
      key: 'TotalApplications',
      icon: 'fa-solid fa-users',
      label: 'Total Applications',
      getValue: (s) => s.totalApplicationsCount ?? 0,
      getTrendPercent: (s) => s.totalApplicationsTrend?.changePercent,
      navigate: () => ['/applications'],
    },
    {
      key: 'UpcomingInterviews',
      icon: 'fa-solid fa-people-arrows',
      label: 'Upcoming Interviews',
      getValue: (s) => s.upcomingInterviewsCount ?? 0,
      navigate: () => ['/interviews/interview-list'],
      queryParams: { status: 'Scheduled' },
    },
    {
      key: 'PendingApprovals',
      icon: 'fa-solid fa-clipboard-check',
      label: 'Pending Approvals',
      getValue: (s) => s.pendingApprovalsCount ?? 0,
      navigate: () => ['/applications'],
    },
    {
      key: 'OffersPendingAcceptance',
      icon: 'fa-solid fa-file-signature',
      label: 'Offers Pending Acceptance',
      getValue: (s) => s.offersPendingAcceptanceCount ?? 0,
      navigate: () => ['/document-management/offer-letter-list'],
    },
  ];

  get role(): UserRoleEnum | null {
    return this.authService.getRole();
  }

  get displayName(): string {
    return this.authService.getUser()?.displayName || 'there';
  }

  get visibleWidgets(): IDashboardWidget[] {
    const visibleKeys = this.summary?.visibleWidgetKeys;
    if (!visibleKeys) return this.widgets;
    return this.widgets.filter((w) => visibleKeys.includes(w.key));
  }

  ngOnInit(): void {
    interval(AUTO_REFRESH_INTERVAL_MS)
      .pipe(startWith(0), untilDestroyed(this))
      .subscribe(() => this.loadSummary());

    if (this.role === UserRoleEnum.Admin) {
      this.loadWidgetConfig();
    }
  }

  reload(): void {
    this.loading = true;
    this.loadSummary();
  }

  private loadSummary(): void {
    this.dashboardService.getSummary().subscribe({
      next: (response) => {
        this.loading = false;
        if (response && !response.hasError && response.content) {
          this.summary = response.content;
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openWidget(widget: IDashboardWidget): void {
    this.router.navigate(widget.navigate(), widget.queryParams ? { queryParams: widget.queryParams } : {});
  }

  // ── Admin widget-visibility toggle (US-105 AC5) ──────────────────

  private loadWidgetConfig(): void {
    this.widgetConfigLoading = true;
    this.dashboardService.getWidgetConfig().subscribe({
      next: (response) => {
        this.widgetConfigs = response && !response.hasError && response.content ? response.content : [];
        this.widgetConfigLoading = false;
      },
      error: () => {
        this.widgetConfigLoading = false;
      },
    });
  }

  toggleWidgetVisibility(config: IDashboardWidgetConfigResponse, field: 'isVisibleForAdmin' | 'isVisibleForHR'): void {
    const updated = { ...config, [field]: !config[field] };
    this.widgetConfigSaving = config.widgetKey;

    this.dashboardService
      .updateWidgetVisibility(config.widgetKey, { isVisibleForAdmin: updated.isVisibleForAdmin, isVisibleForHR: updated.isVisibleForHR })
      .subscribe({
        next: () => {
          config.isVisibleForAdmin = updated.isVisibleForAdmin;
          config.isVisibleForHR = updated.isVisibleForHR;
          this.widgetConfigSaving = null;
          this.loadSummary();
        },
        error: () => {
          this.widgetConfigSaving = null;
        },
      });
  }

  widgetLabel(widgetKey: string): string {
    return this.widgets.find((w) => w.key === widgetKey)?.label ?? widgetKey;
  }
}
