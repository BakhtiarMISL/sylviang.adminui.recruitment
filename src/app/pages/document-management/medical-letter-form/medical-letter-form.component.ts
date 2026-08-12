import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { DocumentTypeEnum, OfferLetterStatusEnum } from '@app/@core/enums/recruitment.enum';
import { DocumentTemplateService } from '@app/@core/services/recruitment/document-template/document-template.service';
import { OfferLetterService } from '@app/@core/services/recruitment/offer-letter/offer-letter.service';
import { MedicalLetterService } from '@app/@core/services/recruitment/medical-letter/medical-letter.service';
import { IDocumentTemplateResponse } from '@core/interfaces/recruitment-management/document-template.interface';
import { IOfferLetterResponse } from '@core/interfaces/recruitment-management/offer-letter.interface';

@Component({
  selector: 'app-medical-letter-form',
  standalone: false,
  templateUrl: './medical-letter-form.component.html',
  styleUrl: './medical-letter-form.component.scss',
})
export class MedicalLetterFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private documentTemplateService: DocumentTemplateService,
    private offerLetterService: OfferLetterService,
    private medicalLetterService: MedicalLetterService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  form!: FormGroup;
  formSubmitted = false;
  submitting = false;
  loading = false;
  errorMessage = '';

  jobApplicationId!: number;
  offerLetter: IOfferLetterResponse | null = null;
  templateOptions: { label: string; value: number }[] = [];
  templates: IDocumentTemplateResponse[] = [];
  // renderPreview() is async (documentTemplateService.preview() is an HTTP call) - without this,
  // clicking Generate right after typing/picking a template (before the response lands) submits
  // with finalBody still empty, since a *disabled* control is excluded from form.invalid and
  // getRawValue() just returns whatever's currently there. Backend then 400s with a bare
  // "Validation Failed" the candidate/HR never sees an obvious cause for.
  previewRendering = false;

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/document-management/offer-letter-list' },
      { title: 'Generate Medical Letter', icon: 'fa-solid fa-file-medical', href: '' },
    ]);

    this.jobApplicationId = Number(this.route.snapshot.queryParamMap.get('jobApplicationId'));

    this.form = this.fb.group({
      medicalTestCenter: [null, [Validators.required, Validators.maxLength(300)]],
      requiredTests: [null, [Validators.required]],
      documentTemplateId: [null, [Validators.required]],
      finalBody: [{ value: '', disabled: true }, [Validators.required]],
    });

    this.loadOfferLetter();
    this.loadTemplates();
  }

  private loadOfferLetter(): void {
    this.loading = true;
    this.offerLetterService.getAll(this.jobApplicationId).subscribe({
      next: (response) => {
        const offerLetters: IOfferLetterResponse[] = !response.hasError && response.content ? response.content : [];
        this.offerLetter = offerLetters.find((o) => o.status === OfferLetterStatusEnum.Accepted) ?? null;
        if (!this.offerLetter) {
          this.errorMessage = 'A medical letter can only be generated once the candidate has an Accepted offer letter.';
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load the offer letter.';
        this.loading = false;
      },
    });
  }

  private loadTemplates(): void {
    this.documentTemplateService.getAll().subscribe({
      next: (response) => {
        this.templates = !response.hasError && response.content ? response.content : [];
        this.templateOptions = this.templates
          .filter((t) => t.documentType === DocumentTypeEnum.MedicalReferral && t.isActive)
          .map((t) => ({ label: t.name, value: t.documentTemplateId }));
      },
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  onFieldChange(): void {
    this.renderPreview();
  }

  onTemplateChange(): void {
    this.renderPreview();
  }

  private renderPreview(): void {
    const templateId = this.form.get('documentTemplateId')?.value;
    const template = this.templates.find((t) => t.documentTemplateId === templateId);
    const bodyControl = this.form.get('finalBody');
    if (!template || !this.offerLetter) {
      bodyControl?.setValue('');
      bodyControl?.disable();
      return;
    }

    const placeholderValues: Record<string, string> = {
      CandidateName: this.offerLetter.candidateName,
      CandidateReference: `JA-${this.jobApplicationId}`,
      MedicalTestCenter: this.form.get('medicalTestCenter')?.value ?? '',
      RequiredTests: this.form.get('requiredTests')?.value ?? '',
      // No candidate-facing "My Medical Letters" page exists (unlike Offer/Appointment Letter) -
      // points at the dashboard instead of leaving the template's {{PortalLink}} unsubstituted.
      PortalLink: `${window.location.origin}/dashboard`,
    };

    this.previewRendering = true;
    this.documentTemplateService.preview({ body: template.body, placeholderValues }).subscribe({
      next: (response) => {
        const rendered = !response.hasError && response.content ? response.content.renderedBody : '';
        bodyControl?.setValue(rendered);
        bodyControl?.enable();
        this.previewRendering = false;
      },
      error: () => {
        this.previewRendering = false;
      },
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.form.invalid || !this.offerLetter || this.previewRendering) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitting = true;
    this.medicalLetterService
      .generate({
        offerLetterId: this.offerLetter.offerLetterId,
        documentTemplateId: value.documentTemplateId,
        medicalTestCenter: value.medicalTestCenter,
        requiredTests: value.requiredTests,
        finalBody: value.finalBody,
      })
      .subscribe({
        next: (response) => {
          this.submitting = false;
          if (response && !response.hasError) {
            this.router.navigate(['/applications', this.jobApplicationId]);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to generate medical letter';
          }
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error?.error?.decentMessage || 'Failed to generate medical letter';
        },
      });
  }
}
