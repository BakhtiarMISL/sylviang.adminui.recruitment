import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { DocumentTemplateService } from '@app/@core/services/recruitment/document-template/document-template.service';
import { OfficeNoteService } from '@app/@core/services/recruitment/office-note/office-note.service';
import { DocumentTypeEnum } from '@app/@core/enums/recruitment.enum';
import { IDocumentTemplateResponse } from '@core/interfaces/recruitment-management/document-template.interface';
import { IOfficeNoteEnclosureItemResponse } from '@core/interfaces/recruitment-management/office-note.interface';

// EP-12 US-129: HR generates an office note listing whichever onboarding enclosures (offer
// letter/appointment letter/joining booklet) exist for a JobApplication. The enclosure checklist
// is fetched up front so HR can see what will be included before submitting.
@Component({
  selector: 'app-office-note-generate',
  standalone: false,
  templateUrl: './office-note-generate.component.html',
  styleUrl: './office-note-generate.component.scss',
})
export class OfficeNoteGenerateComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private documentTemplateService: DocumentTemplateService,
    private officeNoteService: OfficeNoteService,
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
  enclosures: IOfficeNoteEnclosureItemResponse[] = [];
  loadingEnclosures = false;

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/document-management/office-note-list' },
      { title: 'Office Notes', icon: 'fa-solid fa-file-pen', href: '/document-management/office-note-list' },
      { title: 'Generate Office Note', icon: 'fa-solid fa-plus', href: '/document-management/manage-office-note' },
    ]);

    const jobApplicationIdParam = this.route.snapshot.queryParamMap.get('jobApplicationId');
    this.jobApplicationIdLocked = !!jobApplicationIdParam;

    this.form = this.fb.group({
      jobApplicationId: [jobApplicationIdParam ? +jobApplicationIdParam : null, [Validators.required, Validators.min(1)]],
      documentTemplateId: [null, [Validators.required]],
      remarks: [null, [Validators.maxLength(2000)]],
    });

    this.loadTemplates();

    if (jobApplicationIdParam) {
      this.loadEnclosures(+jobApplicationIdParam);
    }
  }

  private loadTemplates(): void {
    this.documentTemplateService.getAll().subscribe({
      next: (response) => {
        const templates: IDocumentTemplateResponse[] = !response.hasError && response.content ? response.content : [];
        this.templateOptions = templates
          .filter((t) => t.documentType === DocumentTypeEnum.OfficeNote && t.isActive)
          .map((t) => ({ label: t.name, value: t.documentTemplateId }));
      },
    });
  }

  private loadEnclosures(jobApplicationId: number): void {
    this.loadingEnclosures = true;
    this.officeNoteService.getEnclosures(jobApplicationId).subscribe({
      next: (response) => {
        this.loadingEnclosures = false;
        this.enclosures = !response.hasError && response.content ? response.content.enclosures : [];
      },
      error: () => {
        this.loadingEnclosures = false;
      },
    });
  }

  get hasAnyEnclosure(): boolean {
    return this.enclosures.some((e) => e.exists);
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
    this.submitting = true;
    this.officeNoteService
      .generate({
        jobApplicationId: value.jobApplicationId,
        documentTemplateId: value.documentTemplateId,
        remarks: value.remarks,
      })
      .subscribe({
        next: (response) => {
          this.submitting = false;
          if (response && !response.hasError) {
            this.router.navigate(['/document-management/office-note-list'], { queryParams: { jobApplicationId: value.jobApplicationId } });
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to generate office note';
          }
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error?.error?.decentMessage || 'Failed to generate office note';
        },
      });
  }
}
