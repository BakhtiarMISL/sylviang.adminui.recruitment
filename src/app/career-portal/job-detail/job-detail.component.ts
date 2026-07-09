import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPublicJobPostingResponse } from '@app/@core/interfaces/recruitment-management/career-portal.interface';
import { CareerPortalService } from '@app/@core/services/recruitment/career-portal/career-portal.service';

@Component({
  selector: 'app-job-detail',
  standalone: false,
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss',
})
export class JobDetailComponent implements OnInit {
  constructor(
    private careerPortalService: CareerPortalService,
    private route: ActivatedRoute,
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
  }

  private loadJobPosting(id: number): void {
    this.loading = true;
    this.notFound = false;
    this.careerPortalService.getJobPostingById(id).subscribe({
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
