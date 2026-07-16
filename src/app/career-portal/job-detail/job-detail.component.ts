import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IJobEligibilityResponse, IPublicJobPostingResponse } from '@app/@core/interfaces/recruitment-management/career-portal.interface';
import { CareerPortalService } from '@app/@core/services/recruitment/career-portal/career-portal.service';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { AuthService } from '@core/services/auth/auth.service';
import { UserRoleEnum } from '@core/enums/user-role.enum';

@Component({
  selector: 'app-job-detail',
  standalone: false,
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss',
})
export class JobDetailComponent implements OnInit {
  constructor(
    private careerPortalService: CareerPortalService,
    private jobApplicationService: JobApplicationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  jobPosting: IPublicJobPostingResponse | null = null;
  loading = true;
  notFound = false;
  eligibilityResult: IJobEligibilityResponse | null = null;

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
    this.eligibilityResult = null;
    this.careerPortalService.getJobPostingById(id).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.jobPosting = response.content;
          this.checkEligibility(id);
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

  private checkEligibility(jobPostingId: number): void {
    if (!this.authService.isAuthenticated() || this.authService.getRole() !== UserRoleEnum.Candidate) return;

    this.jobApplicationService.checkEligibility(jobPostingId).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.eligibilityResult = response.content;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // Eligibility is a nice-to-have on top of the static summary - don't block the page on failure.
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
