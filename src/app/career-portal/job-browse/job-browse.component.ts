import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IPublicJobPostingResponse } from '@app/@core/interfaces/recruitment-management/career-portal.interface';
import { CareerPortalService } from '@app/@core/services/recruitment/career-portal/career-portal.service';
import { UI_CONFIG } from '@app/@core/constants';
import { EmploymentTypeOptions, ExperienceBucketOptions } from '../career-portal.constants';

@Component({
  selector: 'app-job-browse',
  standalone: false,
  templateUrl: './job-browse.component.html',
  styleUrl: './job-browse.component.scss',
})
export class JobBrowseComponent implements OnInit {
  constructor(
    private careerPortalService: CareerPortalService,
    private cdr: ChangeDetectorRef,
  ) {}

  jobPostings: IPublicJobPostingResponse[] = [];
  loading = false;
  totalRecords = 0;
  UI_CONFIG = UI_CONFIG;
  rows = UI_CONFIG.defaultPageSize;
  currentPage = 1;

  employmentTypeOptions = EmploymentTypeOptions;
  experienceBucketOptions = ExperienceBucketOptions;

  searchTerm = '';
  location = '';
  departmentId: number | null = null;
  employmentType: string | null = null;
  maxExperienceYears: number | null = null;

  ngOnInit(): void {
    this.loadJobPostings();
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

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
