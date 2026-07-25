import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { DocumentTypeEnum } from '@app/@core/enums/recruitment.enum';
import { AppointmentLetterService } from '@app/@core/services/recruitment/appointment-letter/appointment-letter.service';
import { DocumentTemplateService } from '@app/@core/services/recruitment/document-template/document-template.service';
import { OfferLetterService } from '@app/@core/services/recruitment/offer-letter/offer-letter.service';
import { IDocumentTemplateResponse } from '@core/interfaces/recruitment-management/document-template.interface';
import { IOfferLetterResponse } from '@core/interfaces/recruitment-management/offer-letter.interface';

@Component({
  selector: 'app-appointment-letter-form',
  standalone: false,
  templateUrl: './appointment-letter-form.component.html',
  styleUrl: './appointment-letter-form.component.scss',
})
export class AppointmentLetterFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private documentTemplateService: DocumentTemplateService,
    private offerLetterService: OfferLetterService,
    private appointmentLetterService: AppointmentLetterService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  form!: FormGroup;
  formSubmitted = false;
  submitting = false;
  loading = false;
  errorMessage = '';

  offerLetter: IOfferLetterResponse | null = null;
  templateOptions: { label: string; value: number }[] = [];
  templates: IDocumentTemplateResponse[] = [];

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/document-management/offer-letter-list' },
      { title: 'Appointment Letters', icon: 'fa-solid fa-file-contract', href: '/document-management/appointment-letter-list' },
      { title: 'Generate Appointment Letter', icon: 'fa-solid fa-plus', href: '' },
    ]);

    const offerLetterId = Number(this.route.snapshot.queryParamMap.get('offerLetterId'));

    this.form = this.fb.group({
      offerLetterId: [offerLetterId, [Validators.required, Validators.min(1)]],
      documentTemplateId: [null, [Validators.required]],
      finalBody: [{ value: '', disabled: true }, [Validators.required]],
    });

    this.loadOfferLetter(offerLetterId);
    this.loadTemplates();
  }

  private loadOfferLetter(offerLetterId: number): void {
    this.loading = true;
    this.offerLetterService.getById(offerLetterId).subscribe({
      next: (response) => {
        this.offerLetter = !response.hasError && response.content ? response.content : null;
        if (!this.offerLetter || this.offerLetter.status !== 'Accepted') {
          this.errorMessage = 'An appointment letter can only be generated for an Accepted offer letter.';
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
          .filter((t) => t.documentType === DocumentTypeEnum.AppointmentLetter && t.isActive)
          .map((t) => ({ label: t.name, value: t.documentTemplateId }));
      },
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  onTemplateChange(): void {
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
      Designation: this.offerLetter.designation,
      OfferedSalary: String(this.offerLetter.offeredSalary),
      JoiningDate: this.offerLetter.joiningDate,
      ReportingManager: this.offerLetter.reportingManager ?? '',
    };

    this.documentTemplateService.preview({ body: template.body, placeholderValues }).subscribe({
      next: (response) => {
        const rendered = !response.hasError && response.content ? response.content.renderedBody : '';
        bodyControl?.setValue(rendered);
        bodyControl?.enable();
      },
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitting = true;
    this.appointmentLetterService
      .generate({
        offerLetterId: value.offerLetterId,
        documentTemplateId: value.documentTemplateId,
        finalBody: value.finalBody,
      })
      .subscribe({
        next: (response) => {
          this.submitting = false;
          if (response && !response.hasError) {
            this.router.navigate(['/document-management/appointment-letter-list'], { queryParams: { jobApplicationId: this.offerLetter?.jobApplicationId } });
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to generate appointment letter';
          }
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error?.error?.decentMessage || 'Failed to generate appointment letter';
        },
      });
  }
}
