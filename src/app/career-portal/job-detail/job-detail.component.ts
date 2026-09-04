import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IJobEligibilityResponse, IPublicJobPostingResponse } from '@app/@core/interfaces/recruitment-management/career-portal.interface';
import { IJobVacancyAttachmentResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy-attachment.interface';
import { IMyApplication } from '@app/@core/interfaces/recruitment-management/job-application.interface';
import { CareerPortalService } from '@app/@core/services/recruitment/career-portal/career-portal.service';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { AuthService } from '@core/services/auth/auth.service';
import { BreadcrumbService } from '@app/@core/services';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { Base_URL } from '@env/environment';

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
    private router: Router,
    private cdr: ChangeDetectorRef,
    private breadcrumbService: BreadcrumbService,
  ) {}

  jobPosting: IPublicJobPostingResponse | null = null;
  loading = true;
  notFound = false;
  eligibilityResult: IJobEligibilityResponse | null = null;
  existingApplication: IMyApplication | null = null;

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.loadJobPosting(+idParam);
      }
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Careers', icon: 'fa-solid fa-magnifying-glass', href: '/careers' },
      { title: this.jobPosting?.title || 'Job Details', icon: 'fa-solid fa-briefcase', href: this.router.url },
    ]);
  }

  private loadJobPosting(id: number): void {
    this.loading = true;
    this.notFound = false;
    this.eligibilityResult = null;
    this.existingApplication = null;
    this.careerPortalService.getJobPostingById(id).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.jobPosting = response.content;
          this.setBreadcrumbs();
          this.checkEligibility(id);
          this.checkExistingApplication(id);
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

  // Applying again already 409s server-side (ApplyFormComponent handles that), but telling
  // the candidate up front - before they fill the whole form and hit resume upload - is a
  // much better experience than letting them find out only after submitting.
  private checkExistingApplication(jobPostingId: number): void {
    if (!this.authService.isAuthenticated() || this.authService.getRole() !== UserRoleEnum.Candidate) return;

    this.jobApplicationService.getMyApplications().subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.existingApplication = response.content.find((a) => a.jobPostingId === jobPostingId) || null;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // Same reasoning as checkEligibility - a nice-to-have, don't block the page over it.
      },
    });
  }

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  goToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }

  getAttachmentDownloadUrl(attachment: IJobVacancyAttachmentResponse): string {
    if (!attachment.downloadUrl) return '';
    if (/^https?:\/\//i.test(attachment.downloadUrl)) return attachment.downloadUrl;
    return `${Base_URL}${attachment.downloadUrl.startsWith('/') ? '' : '/'}${attachment.downloadUrl}`;
  }

  get hasEligibilityInfo(): boolean {
    if (!this.jobPosting) return false;
    const j = this.jobPosting;
    return j.minAge != null || j.maxAge != null || !!j.minEducationLevel || j.minExperienceYears != null || !!j.requiredDistrict;
  }
}
