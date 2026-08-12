import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { DocumentTypeEnum } from '@app/@core/enums/recruitment.enum';
import { DocumentTemplateService } from '@app/@core/services/recruitment/document-template/document-template.service';
import { OfferLetterService } from '@app/@core/services/recruitment/offer-letter/offer-letter.service';
import { FitmentDataService } from '@app/@core/services/recruitment/fitment-data/fitment-data.service';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { IDocumentTemplateResponse } from '@core/interfaces/recruitment-management/document-template.interface';
import { ICandidateHireConflictResponse } from '@core/interfaces/recruitment-management/offer-letter.interface';
import { DateTimeUtility } from '@app/@core/utils/date-time.utility';

@Component({
  selector: 'app-offer-letter-form',
  standalone: false,
  templateUrl: './offer-letter-form.component.html',
  styleUrl: './offer-letter-form.component.scss',
})
export class OfferLetterFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private documentTemplateService: DocumentTemplateService,
    private offerLetterService: OfferLetterService,
    private fitmentDataService: FitmentDataService,
    private jobApplicationService: JobApplicationService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  form!: FormGroup;
  formSubmitted = false;
  submitting = false;
  errorMessage = '';
  jobApplicationIdLocked = false;

  templateOptions: { label: string; value: number }[] = [];

  // Warn-only (never blocks): candidate already Hired elsewhere. Nothing in the pipeline/offer/
  // onboarding flow is scoped to the candidate as a whole, so nothing technically stops HR from
  // hiring the same person into two postings - this just surfaces it at the point of decision.
  hireConflicts: ICandidateHireConflictResponse[] = [];

  // Fitment Data is the authoritative source for Designation when it exists (HR-entered,
  // possibly differs from the posting title - e.g. a promotion offer). The job vacancy's own
  // Title is only a fallback default for the common case where Fitment Data was never filled in.
  // Guards against the two async loads racing: if Fitment Data's response lands after the job
  // title's fallback already filled the field, this flag still lets Fitment Data override it.
  private fitmentDesignationApplied = false;

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/document-management/offer-letter-list' },
      { title: 'Offer Letters', icon: 'fa-solid fa-file-signature', href: '/document-management/offer-letter-list' },
      { title: 'Generate Offer Letter', icon: 'fa-solid fa-plus', href: '/document-management/manage-offer-letter' },
    ]);

    const jobApplicationIdParam = this.route.snapshot.queryParamMap.get('jobApplicationId');
    this.jobApplicationIdLocked = !!jobApplicationIdParam;

    this.form = this.fb.group({
      jobApplicationId: [jobApplicationIdParam ? +jobApplicationIdParam : null, [Validators.required, Validators.min(1)]],
      documentTemplateId: [null, [Validators.required]],
      designation: [null, [Validators.required, Validators.maxLength(200)]],
      offeredSalary: [null, [Validators.required, Validators.min(1)]],
      joiningDate: [null, [Validators.required]],
      reportingManager: [null, [Validators.maxLength(200)]],
      offerValidityDate: [null],
    });

    this.loadTemplates();

    if (this.jobApplicationIdLocked) {
      this.loadHireConflicts(+jobApplicationIdParam!);
      this.loadFitmentData(+jobApplicationIdParam!);
      this.loadJobPostingTitle(+jobApplicationIdParam!);
    } else {
      this.form.get('jobApplicationId')?.valueChanges.subscribe((id) => {
        this.hireConflicts = [];
        this.fitmentDesignationApplied = false;
        if (id && id > 0) {
          this.loadHireConflicts(id);
          this.loadFitmentData(id);
          this.loadJobPostingTitle(id);
        }
      });
    }
  }

  // Fallback default when Fitment Data hasn't been filled in yet - see fitmentDesignationApplied.
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

  // HR already types Designation/Salary into Fitment Data earlier in the hiring flow - prefill
  // from it here instead of making HR retype the same numbers from scratch. Still editable: this
  // is a starting point, not a lock, since the offer can legitimately differ from the fitment.
  private loadFitmentData(jobApplicationId: number): void {
    this.fitmentDataService.getByJobApplication(jobApplicationId).subscribe({
      next: (response) => {
        const fitment = response && !response.hasError ? response.content : null;
        if (!fitment) return;

        if (fitment.designation) this.fitmentDesignationApplied = true;

        this.form.patchValue({
          designation: fitment.designation || this.form.get('designation')?.value,
          offeredSalary: this.form.get('offeredSalary')?.value || fitment.basicSalary + fitment.totalAllowances - fitment.totalDeductions,
        });
      },
      error: () => {
        // No fitment data yet - leave the fields as HR-typed, same as before this existed.
      },
    });
  }

  private loadHireConflicts(jobApplicationId: number): void {
    this.offerLetterService.getCandidateHireConflicts(jobApplicationId).subscribe({
      next: (response) => {
        this.hireConflicts = response && !response.hasError && response.content ? response.content : [];
      },
      error: () => {
        this.hireConflicts = [];
      },
    });
  }

  // Angular templates can't parse arrow functions (`c => c.jobPostingTitle`) in a binding - that's
  // an assignment/arrow expression, which NG5002 rejects - so this has to live here, not inline.
  get hireConflictTitles(): string {
    return this.hireConflicts.map((c) => c.jobPostingTitle).join(', ');
  }

  private loadTemplates(): void {
    this.documentTemplateService.getAll().subscribe({
      next: (response) => {
        const templates: IDocumentTemplateResponse[] = !response.hasError && response.content ? response.content : [];
        this.templateOptions = templates
          .filter((t) => t.documentType === DocumentTypeEnum.OfferLetter && t.isActive)
          .map((t) => ({ label: t.name, value: t.documentTemplateId }));
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

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    // .toISOString() shifts to UTC (the exact anti-pattern the Exam/Interview timezone fix
    // replaced everywhere else) - a local-midnight joining date turns into an 18:00-the-day-
    // before UTC stamp, which then flows straight into the letter placeholder unconverted.
    const joiningDate = value.joiningDate instanceof Date ? DateTimeUtility.toLocalDateTimeString(value.joiningDate) : value.joiningDate;
    const offerValidityDate = value.offerValidityDate instanceof Date ? DateTimeUtility.toLocalDateTimeString(value.offerValidityDate) : value.offerValidityDate;

    this.submitting = true;
    this.offerLetterService
      .generate({
        jobApplicationId: value.jobApplicationId,
        documentTemplateId: value.documentTemplateId,
        designation: value.designation,
        offeredSalary: value.offeredSalary,
        joiningDate,
        reportingManager: value.reportingManager,
        offerValidityDate,
      })
      .subscribe({
        next: (response) => {
          this.submitting = false;
          if (response && !response.hasError) {
            this.router.navigate(['/document-management/offer-letter-list'], { queryParams: { jobApplicationId: value.jobApplicationId } });
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to generate offer letter';
          }
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error?.error?.decentMessage || 'Failed to generate offer letter';
        },
      });
  }
}
