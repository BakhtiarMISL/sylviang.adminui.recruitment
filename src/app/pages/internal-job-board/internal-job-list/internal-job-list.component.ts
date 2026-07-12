import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IPublicJobPostingResponse } from '@app/@core/interfaces/recruitment-management/career-portal.interface';
import { InternalJobBoardService } from '@app/@core/services/recruitment/internal-job-board/internal-job-board.service';
import { UI_CONFIG } from '@app/@core/constants';
import { SortEvent } from 'primeng/api';
import { EmploymentTypeOptions, ExperienceBucketOptions } from '../internal-job-board.constants';
import { InternalJobListColumns } from './internal-job-list.component.constants';

@Component({
  selector: 'app-internal-job-list',
  standalone: false,
  templateUrl: './internal-job-list.component.html',
  styleUrl: './internal-job-list.component.scss',
})
export class InternalJobListComponent implements OnInit, AfterViewInit {
  constructor(
    private internalJobBoardService: InternalJobBoardService,
    private cdr: ChangeDetectorRef,
  ) {}

  jobPostings: IPublicJobPostingResponse[] = [];
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
  location = '';
  departmentId: number | null = null;
  employmentType: string | null = null;
  maxExperienceYears: number | null = null;

  employmentTypeOptions = EmploymentTypeOptions;
  experienceBucketOptions = ExperienceBucketOptions;

  columns = InternalJobListColumns;

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.loadJobPostings();
    this.isLoading = false;
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadJobPostings();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.location = '';
    this.departmentId = null;
    this.employmentType = null;
    this.maxExperienceYears = null;
    this.currentPage = 1;
    this.loadJobPostings();
  }

  loadJobPostings(): void {
    this.loading = true;

    const params = {
      pageNumber: this.currentPage,
      pageSize: this.rows,
      ...(this.searchTerm && this.searchTerm.trim() && { searchTerm: this.searchTerm.trim() }),
      ...(this.location && this.location.trim() && { location: this.location.trim() }),
      ...(this.departmentId !== null && this.departmentId !== undefined && { departmentId: this.departmentId }),
      ...(this.employmentType && { employmentType: this.employmentType }),
      ...(this.maxExperienceYears !== null && this.maxExperienceYears !== undefined && { maxExperienceYears: this.maxExperienceYears }),
      ...(this.sortBy && { sortBy: this.sortBy }),
      ...(this.sortDirection && { sortDirection: this.sortDirection }),
    };

    this.internalJobBoardService.getJobPostings(params).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.jobPostings = response.content.data || [];
          this.totalRecords = response.content.totalCount || 0;
        } else {
          this.jobPostings = [];
          this.totalRecords = 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.jobPostings = [];
        this.totalRecords = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadJobPostings();
  }

  onSort(event: SortEvent) {
    this.sortedColumn = event.field || '';
    this.sortBy = event.field || '';
    this.sortDirection = event.order === 1 ? 'asc' : 'desc';
    this.currentPage = 1;
    this.loadJobPostings();
  }

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
