import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ICandidateProfileSummaryResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { IJobVacancyResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { JobVacancyService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-apply-on-behalf',
  standalone: false,
  templateUrl: './apply-on-behalf.component.html',
  styleUrl: './apply-on-behalf.component.scss',
})
export class ApplyOnBehalfComponent implements OnInit {
  constructor(
    private candidateProfileService: CandidateProfileService,
    private jobVacancyService: JobVacancyService,
    private jobApplicationService: JobApplicationService,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private breadcrumbService: BreadcrumbService,
  ) {}

  openJobPostings: IJobVacancyResponse[] = [];
  candidateSuggestions: ICandidateProfileSummaryResponse[] = [];

  jobPostingId: number | null = null;
  candidateName = '';
  candidateEmail = '';
  candidatePhone = '';
  coverLetter = '';
  resumeFile: File | null = null;

  submitting = false;
  submitError = '';

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'ATS Dashboard', icon: 'fa-solid fa-list-check', href: '/applications' },
      { title: 'Apply on Behalf', icon: 'fa-solid fa-user-plus', href: '/applications/apply-on-behalf' },
    ]);
    this.jobVacancyService.getAllJobVacancies().subscribe({
      next: (response) => {
        const all = response && !response.hasError && response.content ? response.content : [];
        this.openJobPostings = all.filter((p) => p.status === 'Open');
        this.cdr.detectChanges();
      },
    });
  }

  filterCandidates(event: { query: string }): void {
    this.candidateProfileService.getPaged({ page: 1, pageSize: 10, searchTerm: event.query }).subscribe({
      next: (response) => {
        this.candidateSuggestions = response && !response.hasError && response.content ? response.content.data : [];
        this.cdr.detectChanges();
      },
    });
  }

  onCandidateSelect(event: { value: ICandidateProfileSummaryResponse }): void {
    const candidate = event.value;
    this.candidateName = candidate.fullName;
    this.candidateEmail = candidate.email;
    this.candidatePhone = candidate.phone || '';
  }

  onResumeSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.resumeFile = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  canSubmit(): boolean {
    return !!this.jobPostingId && !!this.candidateName.trim() && !!this.candidateEmail.trim() && !!this.resumeFile;
  }

  submit(): void {
    if (!this.canSubmit() || !this.resumeFile || !this.jobPostingId) return;

    this.submitting = true;
    this.submitError = '';

    this.jobApplicationService
      .applyOnBehalf({
        jobPostingId: this.jobPostingId,
        candidateName: this.candidateName.trim(),
        candidateEmail: this.candidateEmail.trim(),
        candidatePhone: this.candidatePhone.trim() || undefined,
        coverLetter: this.coverLetter.trim() || undefined,
        resume: this.resumeFile,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.toast.success({ detail: `Application submitted for ${this.candidateName}.` });
          this.router.navigate(['/applications']);
        },
        error: (error) => {
          this.submitting = false;
          this.submitError = error?.error?.decentMessage || 'Failed to submit application.';
        },
      });
  }
}
