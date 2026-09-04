import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IJobVacancyResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy.interface';
import { JobVacancyService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { JobVacancyListColumns } from './job-vacancy-list.component.constants';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { UI_CONFIG } from '@app/@core/constants';
import { TableStateService } from '@app/@core/services/table-state.service';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-job-vacancy-list',
  standalone: false,
  templateUrl: './job-vacancy-list.component.html',
  styleUrl: './job-vacancy-list.component.scss',
})
export class JobVacancyListComponent implements OnInit, AfterViewInit {
  private readonly STATE_KEY = 'job-vacancy-list';

  constructor(
    private jobVacancyService: JobVacancyService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private toast: ToastService,
    private tableState: TableStateService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  jobVacancies: IJobVacancyResponse[] = [];
  sortedColumn: string = '';
  isLoading = true;
  totalRecords = 0;
  loading = false;
  UI_CONFIG = UI_CONFIG;
  rows: number = UI_CONFIG.defaultPageSize;
  currentPage = 1;

  // Leave the initial sort unset so the vacancy endpoint applies its deterministic default:
  // CreatedAt DESC, then JobPostingId DESC. User-selected column sorts still populate these.
  sortBy: string = '';
  sortDirection: string = '';
  searchTerm = '';
  filtersCollapsed = true;
  postingDateTo: Date | null = null;
  closingDateTo: Date | null = null;

  // EP-15/US-113: additive "My Postings" filter - client-side paginated since a single
  // user's own postings is a small, unpaginated backend result (GET .../my-postings).
  myPostingsOnly = false;
  private allMyPostings: IJobVacancyResponse[] = [];

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  columns = JobVacancyListColumns;

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.restoreState();
    this.loadJobVacancies();
    this.isLoading = false;
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/job-vacancy/job-vacancy-list' },
      { title: 'Job Vacancies', icon: 'fa-solid fa-list', href: '/job-vacancy/job-vacancy-list' },
    ]);
  }

  private restoreState(): void {
    const s = this.tableState.load<{
      currentPage: number;
      rows: number;
      searchTerm: string;
      postingDateTo: string | null;
      closingDateTo: string | null;
      myPostingsOnly: boolean;
      sortBy: string;
      sortDirection: string;
      sortedColumn: string;
    }>(this.STATE_KEY);
    if (s) {
      this.currentPage = s.currentPage ?? this.currentPage;
      this.rows = s.rows ?? this.rows;
      this.searchTerm = s.searchTerm ?? this.searchTerm;
      this.postingDateTo = s.postingDateTo ? new Date(s.postingDateTo) : this.postingDateTo;
      this.closingDateTo = s.closingDateTo ? new Date(s.closingDateTo) : this.closingDateTo;
      this.myPostingsOnly = s.myPostingsOnly ?? this.myPostingsOnly;
      this.sortBy = s.sortBy ?? this.sortBy;
      this.sortDirection = s.sortDirection ?? this.sortDirection;
      this.sortedColumn = s.sortedColumn ?? this.sortedColumn;
    }
  }

  private saveState(): void {
    this.tableState.save(this.STATE_KEY, {
      currentPage: this.currentPage,
      rows: this.rows,
      searchTerm: this.searchTerm,
      postingDateTo: this.postingDateTo ? this.postingDateTo.toISOString() : null,
      closingDateTo: this.closingDateTo ? this.closingDateTo.toISOString() : null,
      myPostingsOnly: this.myPostingsOnly,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      sortedColumn: this.sortedColumn,
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  applySearch() {
    this.currentPage = 1;
    this.filtersCollapsed = true;
    this.loadJobVacancies();
  }

  resetSearch() {
    this.searchTerm = '';
    this.postingDateTo = null;
    this.closingDateTo = null;
    this.myPostingsOnly = false;
    this.currentPage = 1;
    this.filtersCollapsed = false;
    this.saveState();
    this.loadJobVacancies();
  }

  loadJobVacancies() {
    this.saveState();
    if (this.myPostingsOnly) {
      this.loadMyPostings();
      return;
    }

    this.loading = true;

    const params = {
      page: this.currentPage,
      pageSize: this.rows,
      ...(this.searchTerm && this.searchTerm.trim() && { searchTerm: this.searchTerm.trim() }),
      ...(this.postingDateTo && { postingDateTo: this.toDateParameter(this.postingDateTo) }),
      ...(this.closingDateTo && { closingDateTo: this.toDateParameter(this.closingDateTo) }),
      ...(this.sortBy && { sortBy: this.sortBy }),
      ...(this.sortDirection && { sortDirection: this.sortDirection }),
    };

    this.jobVacancyService.getJobVacanciesPaginated(params).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.jobVacancies = response.content.data || [];
          this.totalRecords = response.content.totalCount || 0;
        } else {
          this.jobVacancies = [];
          this.totalRecords = 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.jobVacancies = [];
        this.totalRecords = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleMyPostingsOnly(): void {
    this.currentPage = 1;
    this.filtersCollapsed = true;
    this.loadJobVacancies();
  }

  private loadMyPostings(): void {
    this.loading = true;

    this.jobVacancyService.getMyPostings().subscribe({
      next: (response) => {
        this.allMyPostings = !response.hasError && response.content ? response.content : [];
        this.applyMyPostingsPage();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.allMyPostings = [];
        this.applyMyPostingsPage();
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private applyMyPostingsPage(): void {
    this.totalRecords = this.allMyPostings.length;
    const start = (this.currentPage - 1) * this.rows;
    this.jobVacancies = this.allMyPostings.slice(start, start + this.rows);
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.saveState();

    if (this.myPostingsOnly) {
      this.applyMyPostingsPage();
      this.cdr.detectChanges();
      return;
    }

    this.loadJobVacancies();
  }

  onSort(event: SortEvent) {
    this.sortedColumn = event.field || '';
    this.sortBy = event.field || '';
    this.sortDirection = event.order === 1 ? 'asc' : 'desc';
    this.currentPage = 1;
    this.loadJobVacancies();
  }

  private toDateParameter(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  deleteJobVacancy(vacancy: IJobVacancyResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete job vacancy: ${vacancy.title}?`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.jobVacancyService.deleteJobVacancy(vacancy.jobPostingId).subscribe({
          next: () => {
            this.loadJobVacancies();
          },
          error: (error) => {
            console.error('Error deleting job vacancy:', error);
          },
        });
      },
    });
  }
}
