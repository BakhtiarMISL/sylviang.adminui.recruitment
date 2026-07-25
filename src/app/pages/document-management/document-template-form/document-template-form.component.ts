import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { DocumentTypeEnum } from '@app/@core/enums/recruitment.enum';
import { DocumentTemplateService } from '@app/@core/services/recruitment/document-template/document-template.service';
import { IDocumentTemplateVersionResponse } from '@core/interfaces/recruitment-management/document-template.interface';

const DOCUMENT_TYPE_OPTIONS = [
  { label: 'Offer Letter', value: DocumentTypeEnum.OfferLetter },
  { label: 'Appointment Letter', value: DocumentTypeEnum.AppointmentLetter },
  { label: 'Joining Booklet', value: DocumentTypeEnum.JoiningBooklet },
  { label: 'Medical Referral', value: DocumentTypeEnum.MedicalReferral },
  { label: 'Target Letter', value: DocumentTypeEnum.TargetLetter },
  { label: 'Rejection Letter', value: DocumentTypeEnum.RejectionLetter },
  { label: 'Experience Certificate', value: DocumentTypeEnum.ExperienceCertificate },
  { label: 'Relieving Letter', value: DocumentTypeEnum.RelievingLetter },
];

@Component({
  selector: 'app-document-template-form',
  standalone: false,
  templateUrl: './document-template-form.component.html',
  styleUrl: './document-template-form.component.scss',
})
export class DocumentTemplateFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private documentTemplateService: DocumentTemplateService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  form!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  templateId: number | null = null;
  errorMessage = '';

  documentTypeOptions = DOCUMENT_TYPE_OPTIONS;

  detectedPlaceholders: string[] = [];
  previewBody = '';
  previewValues: Record<string, string> = {};
  previewing = false;

  versions: IDocumentTemplateVersionResponse[] = [];
  showVersions = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      documentType: [DocumentTypeEnum.OfferLetter, [Validators.required]],
      code: [null, [Validators.required, Validators.maxLength(100)]],
      name: [null, [Validators.required, Validators.maxLength(200)]],
      body: [null, [Validators.required]],
    });

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.templateId = +idParam;
        this.isEditMode = true;
        this.form.get('documentType')?.disable();
        this.form.get('code')?.disable();
        this.loadTemplate(this.templateId);
        this.loadVersions(this.templateId);
      } else {
        this.isEditMode = false;
        this.templateId = null;
      }
      this.setBreadcrumbs();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/document-management/document-template-list' },
      { title: 'Document Templates', icon: 'fa-solid fa-file-lines', href: '/document-management/document-template-list' },
      {
        title: this.isEditMode ? 'Edit Template' : 'Add Template',
        icon: 'fa-solid fa-edit',
        href: '/document-management/manage-document-template',
      },
    ]);
  }

  private loadTemplate(id: number): void {
    this.documentTemplateService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.form.patchValue(response.content);
        } else {
          this.router.navigate(['/document-management/document-template-list']);
        }
      },
      error: () => {
        this.router.navigate(['/document-management/document-template-list']);
      },
    });
  }

  private loadVersions(id: number): void {
    this.documentTemplateService.getVersions(id).subscribe({
      next: (response) => {
        this.versions = !response.hasError && response.content ? response.content : [];
      },
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  runPreview(): void {
    const body = this.form.value.body;
    if (!body) return;

    this.previewing = true;
    this.documentTemplateService.preview({ body, placeholderValues: this.previewValues }).subscribe({
      next: (response) => {
        this.previewing = false;
        if (response && !response.hasError && response.content) {
          this.previewBody = response.content.renderedBody;
          this.detectedPlaceholders = response.content.detectedPlaceholders;
          for (const token of this.detectedPlaceholders) {
            if (!(token in this.previewValues)) this.previewValues[token] = '';
          }
        }
      },
      error: () => {
        this.previewing = false;
      },
    });
  }

  toggleVersions(): void {
    this.showVersions = !this.showVersions;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.templateId) {
      const request = {
        name: this.form.value.name,
        body: this.form.value.body,
        isActive: true,
      };
      this.documentTemplateService.update(this.templateId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/document-management/document-template-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update template';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update template';
        },
      });
    } else {
      const request = {
        documentType: this.form.value.documentType,
        code: this.form.value.code,
        name: this.form.value.name,
        body: this.form.value.body,
      };
      this.documentTemplateService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/document-management/document-template-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create template';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create template';
        },
      });
    }
  }
}
