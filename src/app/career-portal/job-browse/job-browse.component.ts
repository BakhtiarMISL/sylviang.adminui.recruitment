import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IPublicJobPostingResponse } from '@app/@core/interfaces/recruitment-management/career-portal.interface';
import { CareerPortalService } from '@app/@core/services/recruitment/career-portal/career-portal.service';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { UI_CONFIG } from '@app/@core/constants';
import { AuthService } from '@core/services/auth/auth.service';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { EmploymentTypeOptions, ExperienceBucketOptions } from '../career-portal.constants';
import { JobBrowseColumns } from './job-browse.component.constants';

interface IJobPostingRow extends IPublicJobPostingResponse {
  alreadyApplied?: boolean;
}

@Component({
  selector: 'app-job-browse',
  standalone: false,
  templateUrl: './job-browse.component.html',
  styleUrl: './job-browse.component.scss',
})
export class JobBrowseComponent implements OnInit, AfterViewInit {
  constructor(
    private careerPortalService: CareerPortalService,
    private jobApplicationService: JobApplicationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  // Reached both pre-login (top-level /careers, standalone public layout) and post-login
  // (same module nested under Shell, see pages-routing.module.ts) - suppress the page's own
  // public navbar in the latter case so it doesn't stack with Shell's sidebar/header.
  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  jobPostings: IJobPostingRow[] = [];
  loading = false;
  // Job posting ids the current candidate has already applied to - fetched once (not
  // per-page, "My Applications" isn't paginated either) so re-sorting/tagging works
  // regardless of which page of results just loaded.
  private appliedJobPostingIds = new Set<number>();
  totalRecords = 0;
  UI_CONFIG = UI_CONFIG;
  rows = UI_CONFIG.defaultPageSize;
  currentPage = 1;

  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  employmentTypeOptions = EmploymentTypeOptions;
  experienceBucketOptions = ExperienceBucketOptions;

  sortOptions = JobBrowseColumns.filter((col) => col.sortable !== false).map((col) => ({ label: col.label, value: col.field }));
  filtersCollapsed = true;

  searchTerm = '';
  location = '';
  employmentType: string | null = null;
  maxExperienceYears: number | null = null;

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    if (this.isLoggedIn && this.authService.getRole() === UserRoleEnum.Candidate) {
      this.jobApplicationService.getMyApplications().subscribe({
        next: (response) => {
          if (!response.hasError && response.content) {
            this.appliedJobPostingIds = new Set(response.content.map((a) => a.jobPostingId));
            this.applyAppliedFlag();
            this.cdr.detectChanges();
          }
        },
        // Not knowing which jobs are already applied is a degraded-but-fine state - don't
        // block the listing from loading over it.
        error: () => {},
      });
    }

    this.loadJobPostings();
  }

  // Tags each row and pushes already-applied postings to the bottom of the current page,
  // rather than the top of the next one - a real backend-driven sort would need the API to
  // know the requesting candidate's identity in the public listing query, which is a bigger
  // change than this page-local re-order justifies for how few open postings exist at once.
  private applyAppliedFlag(): void {
    this.jobPostings = this.jobPostings
      .map((job) => ({ ...job, alreadyApplied: this.appliedJobPostingIds.has(job.jobPostingId) }))
      .sort((a, b) => Number(!!a.alreadyApplied) - Number(!!b.alreadyApplied));
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
          this.applyAppliedFlag();
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

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
