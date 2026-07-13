import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationSourceEnum, ApplicationStatusEnum } from '@app/@core/enums/recruitment.enum';
import { IApplicationStatusReason, IJobApplicationListItem } from '@app/@core/interfaces/recruitment-management/job-application.interface';
import { IJobVacancyResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy.interface';
import { IShortlistFilterApplyResponse, IShortlistFilterLookupResponse } from '@app/@core/interfaces/recruitment-management/shortlist-filter.interface';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { JobVacancyService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy.service';
import { ShortlistFilterService } from '@app/@core/services/recruitment/shortlist-filter/shortlist-filter.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { UI_CONFIG } from '@app/@core/constants';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { ApplicationStatusOptions, StatusesRequiringReason } from '../application-status-transitions.constants';
import { AtsDashboardColumns } from './ats-dashboard.component.constants';

@Component({
  selector: 'app-ats-dashboard',
  standalone: false,
  templateUrl: './ats-dashboard.component.html',
  styleUrl: './ats-dashboard.component.scss',
})
export class AtsDashboardComponent implements OnInit, AfterViewInit {
  constructor(
    private jobApplicationService: JobApplicationService,
    private jobVacancyService: JobVacancyService,
    private shortlistFilterService: ShortlistFilterService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private toast: ToastService,
    private router: Router,
  ) {}

  applications: IJobApplicationListItem[] = [];
  selectedApplications: IJobApplicationListItem[] = [];
  jobPostings: IJobVacancyResponse[] = [];
  statusOptions = ApplicationStatusOptions;
  sourceOptions = Object.values(ApplicationSourceEnum).map((value) => ({ label: value, value }));

  sortedColumn = '';
  isLoading = true;
  loading = false;
  totalRecords = 0;
  UI_CONFIG = UI_CONFIG;
  rows = UI_CONFIG.defaultPageSize;
  currentPage = 1;
  sortBy = '';
  sortDirection = '';
  columns = AtsDashboardColumns;

  // Filters (US-035 AC2)
  filterJobPostingId: number | null = null;
  filterStatus: ApplicationStatusEnum | null = null;
  filterSource: ApplicationSourceEnum | null = null;
  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;

  // Bulk action (US-035 AC5)
  bulkToStatus: ApplicationStatusEnum | null = null;
  bulkReasonId: number | null = null;
  bulkNote = '';
  bulkReasonOptions: IApplicationStatusReason[] = [];
  bulkStatusOptions = ApplicationStatusOptions;
  bulkApplying = false;

  // Bulk selection across pages (US-047 AC5)
  selectAllMatchingActive = false;
  selectedAllIds: number[] = [];
  loadingSelectAll = false;
  shortlisting = false;

  // Pipeline progress tracker dialog (US-042 AC5)
  pipelineDialogVisible = false;
  pipelineDialogApplicationId: number | null = null;

  // Apply shortlist filter to vacancy (US-044)
  shortlistFilters: IShortlistFilterLookupResponse[] = [];
  selectedShortlistFilterId: number | null = null;
  applyingShortlistFilter = false;
  shortlistApplySummary: IShortlistFilterApplyResponse | null = null;
  shortlistApplySummaryVisible = false;

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.loadJobPostings();
    this.loadApplications();
    this.loadShortlistFilters();
    this.isLoading = false;
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  loadJobPostings(): void {
    this.jobVacancyService.getAllJobVacancies().subscribe({
      next: (response) => {
        this.jobPostings = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  onSelectionChange(event: any): void {
    this.selectedApplications = event;
    this.selectAllMatchingActive = false;
    this.selectedAllIds = [];
    this.bulkToStatus = null;
    this.bulkReasonId = null;
    this.bulkNote = '';
    this.cdr.detectChanges();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadApplications();
  }

  resetFilters(): void {
    this.filterJobPostingId = null;
    this.filterStatus = null;
    this.filterSource = null;
    this.filterDateFrom = null;
    this.filterDateTo = null;
    this.currentPage = 1;
    this.loadApplications();
  }

  /** Filter-only query params (no page/sort) shared by loadApplications and select-all-matching (US-047 AC5). */
  buildFilterParams(): any {
    return {
      ...(this.filterJobPostingId && { jobPostingId: this.filterJobPostingId }),
      ...(this.filterStatus && { status: this.filterStatus }),
      ...(this.filterSource && { source: this.filterSource }),
      ...(this.filterDateFrom && { dateFrom: this.filterDateFrom.toISOString() }),
      ...(this.filterDateTo && { dateTo: this.filterDateTo.toISOString() }),
    };
  }

  loadApplications(): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      pageSize: this.rows,
      ...(this.sortBy && { sortBy: this.sortBy }),
      ...(this.sortDirection && { sortDirection: this.sortDirection }),
      ...this.buildFilterParams(),
    };

    this.jobApplicationService.getDashboardPaged(params).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.applications = response.content.data || [];
          this.totalRecords = response.content.totalCount || 0;
          this.selectedApplications = [];
          this.selectAllMatchingActive = false;
          this.selectedAllIds = [];
        } else {
          this.applications = [];
          this.totalRecords = 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.applications = [];
        this.totalRecords = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadApplications();
  }

  onSort(event: SortEvent): void {
    this.sortedColumn = event.field || '';
    this.sortBy = event.field || '';
    this.sortDirection = event.order === 1 ? 'asc' : 'desc';
    this.currentPage = 1;
    this.loadApplications();
  }

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  openDetail(application: IJobApplicationListItem): void {
    this.router.navigate(['/applications', application.jobApplicationId]);
  }

  openPipelineTracker(application: IJobApplicationListItem): void {
    this.pipelineDialogApplicationId = application.jobApplicationId;
    this.pipelineDialogVisible = true;
  }

  loadShortlistFilters(): void {
    this.shortlistFilterService.getLookup().subscribe({
      next: (response) => {
        this.shortlistFilters = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  canApplyShortlistFilter(): boolean {
    return !!this.filterJobPostingId && !!this.selectedShortlistFilterId;
  }

  applyShortlistFilter(event: Event): void {
    if (!this.filterJobPostingId || !this.selectedShortlistFilterId) return;

    const filterName = this.shortlistFilters.find((f) => f.shortlistFilterId === this.selectedShortlistFilterId)?.name;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Apply "${filterName}" to every application of this vacancy? Candidates who meet the criteria will be moved to Shortlisted.`,
      header: 'Apply Shortlist Filter',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.applyingShortlistFilter = true;

        this.shortlistFilterService
          .apply({ shortlistFilterId: this.selectedShortlistFilterId!, jobPostingId: this.filterJobPostingId! })
          .subscribe({
            next: (response) => {
              this.applyingShortlistFilter = false;
              this.shortlistApplySummary = response?.content ?? null;
              this.shortlistApplySummaryVisible = true;
              this.loadApplications();
            },
            error: (error) => {
              this.applyingShortlistFilter = false;
              this.toast.error({ detail: error?.error?.decentMessage || 'Failed to apply shortlist filter.' });
            },
          });
      },
    });
  }

  // ── Bulk selection across pages (US-047 AC5) ────────────────────

  selectedCount(): number {
    return this.selectAllMatchingActive ? this.selectedAllIds.length : this.selectedApplications.length;
  }

  getSelectedIds(): number[] {
    return this.selectAllMatchingActive ? this.selectedAllIds : this.selectedApplications.map((a) => a.jobApplicationId);
  }

  selectAllMatching(): void {
    this.loadingSelectAll = true;

    this.jobApplicationService.getDashboardMatchingIds(this.buildFilterParams()).subscribe({
      next: (response) => {
        this.loadingSelectAll = false;
        this.selectedAllIds = response && !response.hasError && response.content ? response.content : [];
        this.selectAllMatchingActive = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loadingSelectAll = false;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to select all matching applications.' });
      },
    });
  }

  clearSelection(): void {
    this.selectedApplications = [];
    this.selectedAllIds = [];
    this.selectAllMatchingActive = false;
  }

  // ── Dedicated "Shortlist Selected" bulk action (US-047 AC2/AC3) ─

  shortlistSelected(event: Event): void {
    const ids = this.getSelectedIds();
    if (ids.length === 0) return;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Move ${ids.length} application(s) to Shortlisted?`,
      header: 'Shortlist Selected',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.shortlisting = true;

        this.jobApplicationService
          .bulkUpdateStatus({ jobApplicationIds: ids, toStatus: ApplicationStatusEnum.Shortlisted })
          .subscribe({
            next: (response) => {
              this.shortlisting = false;
              const result = response?.content;
              if (result && result.failed.length > 0) {
                this.toast.warn({ detail: `${result.succeededIds.length} shortlisted, ${result.failed.length} failed.` });
              } else {
                this.toast.success({ detail: 'Applications shortlisted.' });
              }
              this.clearSelection();
              this.loadApplications();
            },
            error: (error) => {
              this.shortlisting = false;
              this.toast.error({ detail: error?.error?.decentMessage || 'Failed to shortlist applications.' });
            },
          });
      },
    });
  }

  onBulkStatusChange(status: ApplicationStatusEnum | null): void {
    this.bulkReasonId = null;
    this.bulkReasonOptions = [];

    if (status && StatusesRequiringReason.includes(status)) {
      this.jobApplicationService.getStatusReasons(status).subscribe({
        next: (response) => {
          this.bulkReasonOptions = response && !response.hasError && response.content ? response.content : [];
          this.cdr.detectChanges();
        },
      });
    }
  }

  bulkRequiresReason(): boolean {
    return !!this.bulkToStatus && StatusesRequiringReason.includes(this.bulkToStatus);
  }

  canApplyBulk(): boolean {
    if (!this.bulkToStatus || this.selectedCount() === 0) return false;
    return !this.bulkRequiresReason() || !!this.bulkReasonId;
  }

  applyBulkStatus(event: Event): void {
    if (!this.bulkToStatus) return;
    const ids = this.getSelectedIds();

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Move ${ids.length} application(s) to ${this.formatEnumLabel(this.bulkToStatus)}?`,
      header: 'Confirm Bulk Status Update',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.bulkApplying = true;

        this.jobApplicationService
          .bulkUpdateStatus({
            jobApplicationIds: ids,
            toStatus: this.bulkToStatus!,
            reasonId: this.bulkReasonId ?? undefined,
            note: this.bulkNote || undefined,
          })
          .subscribe({
            next: (response) => {
              this.bulkApplying = false;
              const result = response?.content;
              if (result && result.failed.length > 0) {
                this.toast.warn({ detail: `${result.succeededIds.length} succeeded, ${result.failed.length} failed.` });
              } else {
                this.toast.success({ detail: 'Applications updated.' });
              }
              this.bulkToStatus = null;
              this.bulkReasonId = null;
              this.bulkNote = '';
              this.clearSelection();
              this.loadApplications();
            },
            error: (error) => {
              this.bulkApplying = false;
              this.toast.error({ detail: error?.error?.decentMessage || 'Failed to update applications.' });
            },
          });
      },
    });
  }
}
