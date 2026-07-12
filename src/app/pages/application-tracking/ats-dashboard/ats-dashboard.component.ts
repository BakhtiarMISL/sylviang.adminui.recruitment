import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationSourceEnum, ApplicationStatusEnum } from '@app/@core/enums/recruitment.enum';
import { IApplicationStatusReason, IJobApplicationListItem } from '@app/@core/interfaces/recruitment-management/job-application.interface';
import { IJobVacancyResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy.interface';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { JobVacancyService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy.service';
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

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.loadJobPostings();
    this.loadApplications();
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

  loadApplications(): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      pageSize: this.rows,
      ...(this.sortBy && { sortBy: this.sortBy }),
      ...(this.sortDirection && { sortDirection: this.sortDirection }),
      ...(this.filterJobPostingId && { jobPostingId: this.filterJobPostingId }),
      ...(this.filterStatus && { status: this.filterStatus }),
      ...(this.filterSource && { source: this.filterSource }),
      ...(this.filterDateFrom && { dateFrom: this.filterDateFrom.toISOString() }),
      ...(this.filterDateTo && { dateTo: this.filterDateTo.toISOString() }),
    };

    this.jobApplicationService.getDashboardPaged(params).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.applications = response.content.data || [];
          this.totalRecords = response.content.totalCount || 0;
          this.selectedApplications = [];
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
    if (!this.bulkToStatus || this.selectedApplications.length === 0) return false;
    return !this.bulkRequiresReason() || !!this.bulkReasonId;
  }

  applyBulkStatus(event: Event): void {
    if (!this.bulkToStatus) return;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Move ${this.selectedApplications.length} application(s) to ${this.formatEnumLabel(this.bulkToStatus)}?`,
      header: 'Confirm Bulk Status Update',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.bulkApplying = true;

        this.jobApplicationService
          .bulkUpdateStatus({
            jobApplicationIds: this.selectedApplications.map((a) => a.jobApplicationId),
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
