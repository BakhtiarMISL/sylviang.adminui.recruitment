import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { FitmentDataService } from '@app/@core/services/recruitment/fitment-data/fitment-data.service';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';

// EP-12 US-097: manual-entry grade/designation/salary structure per JobApplication. Mirrors
// OfferLetterFormComponent's ?jobApplicationId= locked-field pattern; create-or-update via a
// single Upsert submit, no separate create/edit routes needed.
@Component({
  selector: 'app-fitment-data-form',
  standalone: false,
  templateUrl: './fitment-data-form.component.html',
  styleUrl: './fitment-data-form.component.scss',
})
export class FitmentDataFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private fitmentDataService: FitmentDataService,
    private jobApplicationService: JobApplicationService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
  ) {}

  form!: FormGroup;
  formSubmitted = false;
  loading = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';
  jobApplicationIdLocked = false;

  // Existing Fitment Data (if this application already has a row) is authoritative for
  // Designation; the job vacancy's own Title is only a fallback default. Guards against the two
  // async loads racing - see loadJobPostingTitle.
  private fitmentDesignationApplied = false;

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/document-management/manage-fitment-data' },
      { title: 'Fitment Data', icon: 'fa-solid fa-sack-dollar', href: '/document-management/manage-fitment-data' },
    ]);

    const jobApplicationIdParam = this.route.snapshot.queryParamMap.get('jobApplicationId');
    this.jobApplicationIdLocked = !!jobApplicationIdParam;

    this.form = this.fb.group({
      jobApplicationId: [jobApplicationIdParam ? +jobApplicationIdParam : null, [Validators.required, Validators.min(1)]],
      designation: [null, [Validators.required, Validators.maxLength(200)]],
      grade: [null, [Validators.maxLength(100)]],
      location: [null, [Validators.maxLength(200)]],
      basicSalary: [null, [Validators.required, Validators.min(0)]],
      totalAllowances: [0, [Validators.min(0)]],
      totalDeductions: [0, [Validators.min(0)]],
    });

    if (jobApplicationIdParam) {
      this.load(+jobApplicationIdParam);
      this.loadJobPostingTitle(+jobApplicationIdParam);
    } else {
      // Free-entry mode: HR types the Job Application ID directly into the form (no
      // ?jobApplicationId= query param) - previously nothing fetched until Save, so existing
      // Fitment Data (or the job title fallback) never appeared.
      this.form.get('jobApplicationId')?.valueChanges.subscribe((id) => {
        this.fitmentDesignationApplied = false;
        if (id && id > 0) {
          this.load(id);
          this.loadJobPostingTitle(id);
        }
      });
    }
  }

  private load(jobApplicationId: number): void {
    this.loading = true;
    this.fitmentDataService.getByJobApplication(jobApplicationId).subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.hasError && response.content) {
          if (response.content.designation) this.fitmentDesignationApplied = true;
          this.form.patchValue(response.content);
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  // Fallback default when this application has no Fitment Data row yet - see
  // fitmentDesignationApplied.
  private loadJobPostingTitle(jobApplicationId: number): void {
    this.jobApplicationService.getDetail(jobApplicationId).subscribe({
      next: (response) => {
        const title = response && !response.hasError ? response.content?.jobPostingTitle : null;
        if (!title || this.fitmentDesignationApplied) return;
        if (!this.form.get('designation')?.value) {
          this.form.patchValue({ designation: title });
        }
      },
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.fitmentDataService.upsert(this.form.value).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response && !response.hasError) {
          this.successMessage = 'Fitment data saved.';
          this.form.markAsPristine();
        } else {
          this.errorMessage = response?.decentMessage || 'Failed to save fitment data.';
        }
      },
      error: (error) => {
        this.submitting = false;
        this.errorMessage = error?.error?.decentMessage || 'Failed to save fitment data.';
      },
    });
  }
}
