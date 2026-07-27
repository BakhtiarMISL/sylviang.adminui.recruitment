import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { FitmentDataService } from '@app/@core/services/recruitment/fitment-data/fitment-data.service';

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
    }
  }

  private load(jobApplicationId: number): void {
    this.loading = true;
    this.fitmentDataService.getByJobApplication(jobApplicationId).subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.hasError && response.content) {
          this.form.patchValue(response.content);
        }
      },
      error: () => {
        this.loading = false;
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
