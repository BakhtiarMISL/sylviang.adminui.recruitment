import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IPublicJobPostingResponse } from '@app/@core/interfaces/recruitment-management/career-portal.interface';
import { CareerPortalService } from '@app/@core/services/recruitment/career-portal/career-portal.service';
import { UI_CONFIG } from '@app/@core/constants';
import { AuthService } from '@core/services/auth/auth.service';
import { SortEvent } from 'primeng/api';
import { EmploymentTypeOptions, ExperienceBucketOptions } from '../career-portal.constants';
import { JobBrowseColumns } from './job-browse.component.constants';

@Component({
  selector: 'app-job-browse',
  standalone: false,
  templateUrl: './job-browse.component.html',
  styleUrl: './job-browse.component.scss',
})
export class JobBrowseComponent implements OnInit, AfterViewInit {
  constructor(
    private careerPortalService: CareerPortalService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  // Reached both pre-login (top-level /careers, standalone public layout) and post-login
  // (same module nested under Shell, see pages-routing.module.ts) - suppress the page's own
  // public navbar in the latter case so it doesn't stack with Shell's sidebar/header.
  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  jobPostings: IPublicJobPostingResponse[] = [];
  loading = false;
  totalRecords = 0;
  UI_CONFIG = UI_CONFIG;
  rows = UI_CONFIG.defaultPageSize;
  currentPage = 1;

  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  employmentTypeOptions = EmploymentTypeOptions;
  experienceBucketOptions = ExperienceBucketOptions;

  sortOptions = JobBrowseColumns.filter((col) => col.sortable !== false).map((col) => ({ label: col.label, value: col.field }));
  // Table view (logged-in / Shell-nested) sorts via column header click instead of the card view's dropdown.
  columns = JobBrowseColumns;
  filtersCollapsed = true;

  searchTerm = '';
  location = '';
  departmentId: number | null = null;
  employmentType: string | null = null;
  maxExperienceYears: number | null = null;

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.loadJobPostings();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.filtersCollapsed = true;
    this.loadJobPostings();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.location = '';
    this.departmentId = null;
    this.employmentType = null;
    this.maxExperienceYears = null;
    this.currentPage = 1;
    this.filtersCollapsed = false;
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
      ...(this.sortField && { sortBy: this.sortField }),
      ...(this.sortField && { sortDirection: this.sortDirection }),
    };

    this.careerPortalService.getJobPostings(params).subscribe({
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

  onSortChange(): void {
    this.currentPage = 1;
    this.loadJobPostings();
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.currentPage = 1;
    this.loadJobPostings();
  }

  onSort(event: SortEvent): void {
    this.sortField = event.field || null;
    this.sortDirection = event.order === 1 ? 'asc' : 'desc';
    this.currentPage = 1;
    this.loadJobPostings();
  }

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
