import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { DocumentTypeEnum } from '@app/@core/enums/recruitment.enum';
import { DocumentTemplateService } from '@app/@core/services/recruitment/document-template/document-template.service';
import { OfferLetterService } from '@app/@core/services/recruitment/offer-letter/offer-letter.service';
import { IDocumentTemplateResponse } from '@core/interfaces/recruitment-management/document-template.interface';

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
