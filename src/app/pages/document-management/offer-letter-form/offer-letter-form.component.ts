import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { DocumentTypeEnum, RecommendationStatusEnum } from '@app/@core/enums/recruitment.enum';
import { DocumentTemplateService } from '@app/@core/services/recruitment/document-template/document-template.service';
import { OfferLetterService } from '@app/@core/services/recruitment/offer-letter/offer-letter.service';
import { CandidateRecommendationService } from '@app/@core/services/recruitment/candidate-recommendation/candidate-recommendation.service';
import { IDocumentTemplateResponse } from '@core/interfaces/recruitment-management/document-template.interface';
import { ICandidateHireConflictResponse } from '@core/interfaces/recruitment-management/offer-letter.interface';

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
    private candidateRecommendationService: CandidateRecommendationService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  form!: FormGroup;
  formSubmitted = false;
  submitting = false;
  errorMessage = '';
  jobApplicationIdLocked = false;
  recommendationAccepted: boolean | null = null;

  templateOptions: { label: string; value: number }[] = [];

  // Warn-only (never blocks): candidate already Hired elsewhere. Nothing in the pipeline/offer/
  // onboarding flow is scoped to the candidate as a whole, so nothing technically stops HR from
  // hiring the same person into two postings - this just surfaces it at the point of decision.
  hireConflicts: ICandidateHireConflictResponse[] = [];

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
      this.loadRecommendation(+jobApplicationIdParam!);
      this.loadHireConflicts(+jobApplicationIdParam!);
    } else {
      this.form.get('jobApplicationId')?.valueChanges.subscribe((id) => {
        this.hireConflicts = [];
        if (id && id > 0) this.loadHireConflicts(id);
      });
    }
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

  private loadRecommendation(jobApplicationId: number): void {
    this.candidateRecommendationService.getLatest(jobApplicationId).subscribe({
      next: (response) => {
        const recommendation = response && !response.hasError ? response.content : null;
        this.recommendationAccepted = recommendation?.status === RecommendationStatusEnum.Accepted;
        if (!this.recommendationAccepted) {
          this.errorMessage = 'An offer letter can only be generated once the candidate has an Accepted final selection recommendation.';
        }
      },
      error: () => {
        this.recommendationAccepted = false;
      },
    });
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

    if (this.jobApplicationIdLocked && !this.recommendationAccepted) return;

    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const joiningDate = value.joiningDate instanceof Date ? value.joiningDate.toISOString() : value.joiningDate;
    const offerValidityDate = value.offerValidityDate instanceof Date ? value.offerValidityDate.toISOString() : value.offerValidityDate;

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
