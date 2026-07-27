import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IJobVacancyResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy.interface';
import { JobVacancyService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { JobVacancyListColumns } from './job-vacancy-list.component.constants';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { UI_CONFIG } from '@app/@core/constants';

@Component({
  selector: 'app-job-vacancy-list',
  standalone: false,
  templateUrl: './job-vacancy-list.component.html',
  styleUrl: './job-vacancy-list.component.scss',
})
export class JobVacancyListComponent implements OnInit, AfterViewInit {
  constructor(
    private jobVacancyService: JobVacancyService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private toast: ToastService,
  ) {}

  jobVacancies: IJobVacancyResponse[] = [];
  selectedJobVacancies: IJobVacancyResponse[] = [];
  sortedColumn: string = '';
  isLoading = true;
  totalRecords = 0;
  loading = false;
  UI_CONFIG = UI_CONFIG;
  rows = UI_CONFIG.defaultPageSize;
  currentPage = 1;

  sortBy: string = '';
  sortDirection: string = '';
  searchTerm = '';

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  columns = JobVacancyListColumns;

  ngOnInit(): void {
    this.loadJobVacancies();
    this.isLoading = false;
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onSelectionChange(event: any) {
    this.selectedJobVacancies = event;
    this.cdr.detectChanges();
  }

  applySearch() {
    this.currentPage = 1;
    this.loadJobVacancies();
  }

  resetSearch() {
    this.searchTerm = '';
    this.loadJobVacancies();
  }

  loadJobVacancies() {
    this.loading = true;

    const params = {
      page: this.currentPage,
      pageSize: this.rows,
      ...(this.searchTerm && this.searchTerm.trim() && { searchTerm: this.searchTerm.trim() }),
      ...(this.sortBy && { sortBy: this.sortBy }),
      ...(this.sortDirection && { sortDirection: this.sortDirection }),
    };

    this.jobVacancyService.getJobVacanciesPaginated(params).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.jobVacancies = response.content.data || [];
          this.totalRecords = response.content.totalCount || 0;
          this.selectedJobVacancies = [];
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

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadJobVacancies();
  }

  onSort(event: SortEvent) {
    this.sortedColumn = event.field || '';
    this.sortBy = event.field || '';
    this.sortDirection = event.order === 1 ? 'asc' : 'desc';
    this.currentPage = 1;
    this.loadJobVacancies();
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
