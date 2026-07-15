import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPublicJobPostingResponse } from '@app/@core/interfaces/recruitment-management/career-portal.interface';
import { InternalJobBoardService } from '@app/@core/services/recruitment/internal-job-board/internal-job-board.service';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-internal-job-detail',
  standalone: false,
  templateUrl: './internal-job-detail.component.html',
  styleUrl: './internal-job-detail.component.scss',
})
export class InternalJobDetailComponent implements OnInit {
  constructor(
    private internalJobBoardService: InternalJobBoardService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  jobPosting: IPublicJobPostingResponse | null = null;
  loading = true;
  notFound = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.loadJobPosting(+idParam);
      }
    });
    this.setBreadcrumbs();
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      {
        title: 'Internal Job Board',
        icon: 'fa-solid fa-building',
        href: '/internal-jobs/job-list',
      },
      {
        title: 'Job Details',
        icon: 'fa-solid fa-briefcase',
        href: '',
      },
    ]);
  }

  private loadJobPosting(id: number): void {
    this.loading = true;
    this.notFound = false;
    this.internalJobBoardService.getJobPostingById(id).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.jobPosting = response.content;
        } else {
          this.notFound = true;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  get hasEligibilityInfo(): boolean {
    if (!this.jobPosting) return false;
    const j = this.jobPosting;
    return j.minAge != null || j.maxAge != null || !!j.minEducationLevel || j.minExperienceYears != null || !!j.requiredDistrict;
  }
}
