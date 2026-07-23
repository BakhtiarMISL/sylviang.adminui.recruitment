import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { IJobVacancyAttachmentResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy-attachment.interface';
import { IJobVacancyCreateRequest, IJobVacancyResponse, IJobVacancyUpdateRequest } from '@app/@core/interfaces/recruitment-management/job-vacancy.interface';
import { IHiringPipelineLookupResponse } from '@app/@core/interfaces/recruitment-management/hiring-pipeline.interface';
import { BreadcrumbService } from '@app/@core/services';
import { JobVacancyAttachmentService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy-attachment.service';
import { JobVacancyService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy.service';
import { HiringPipelineService } from '@app/@core/services/recruitment/hiring-pipeline/hiring-pipeline.service';
import { JobStatusEnum } from '@app/@core/enums/recruitment.enum';
import { DateTimeUtility } from '@app/@core/utils/date-time.utility';
import { Base_URL } from '@env/environment';
import { CircularTypeOptions, CurrencyOptions, EducationLevelOptions, EmploymentTypeOptions, JobStatusLegalNextStates, JobStatusOptions } from './manage-job-vacancy.component.constants';

@Component({
  selector: 'app-manage-job-vacancy',
  standalone: false,
  templateUrl: './manage-job-vacancy.component.html',
  styleUrl: './manage-job-vacancy.component.scss',
})
export class ManageJobVacancyComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private jobVacancyService: JobVacancyService,
    private jobVacancyAttachmentService: JobVacancyAttachmentService,
    private hiringPipelineService: HiringPipelineService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
  ) {}

  jobVacancyForm!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  jobPostingId: number | null = null;
  jobVacancyToEdit: IJobVacancyResponse | null = null;

  employmentTypeOptions = EmploymentTypeOptions;
  circularTypeOptions = CircularTypeOptions;
  educationLevelOptions = EducationLevelOptions;
  jobStatusOptions = JobStatusOptions;
  currencyOptions = CurrencyOptions;
  currencySuggestions: string[] = [];
  hiringPipelineOptions: IHiringPipelineLookupResponse[] = [];

  // Attachments
  @ViewChild('attachmentFileInput') attachmentFileInput!: ElementRef<HTMLInputElement>;
  attachments: IJobVacancyAttachmentResponse[] = [];
  loadingAttachments = false;
  uploadingAttachment = false;
  selectedFile: File | null = null;
  attachmentError = '';

  get statusOptionsForCurrentState() {
    const currentStatus = this.jobVacancyToEdit?.status;
    if (!currentStatus) return this.jobStatusOptions;
    const legalNextStates = JobStatusLegalNextStates[currentStatus] || [currentStatus];
    return this.jobStatusOptions.filter((option) => legalNextStates.includes(option.value));
  }

  get canManageAttachments(): boolean {
    return this.jobPostingId !== null;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadHiringPipelineOptions();

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.jobPostingId = +idParam;
        this.isEditMode = true;
        this.loadJobVacancy(this.jobPostingId);
        this.loadAttachments(this.jobPostingId);
      } else {
        this.isEditMode = false;
        this.jobPostingId = null;
        this.attachments = [];
      }
      this.setBreadcrumbs();
    });
  }

  private loadHiringPipelineOptions(): void {
    this.hiringPipelineService.getActiveLookup().subscribe({
      next: (response) => {
        this.hiringPipelineOptions = !response.hasError && response.content ? response.content : [];
      },
      error: () => {
        this.hiringPipelineOptions = [];
      },
    });
  }

  private loadJobVacancy(id: number): void {
    this.jobVacancyService.getJobVacancyById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.jobVacancyToEdit = response.content;
          const data = response.content;
          this.jobVacancyForm.patchValue({
            ...data,
            postingDate: data.postingDate ? new Date(data.postingDate) : null,
            closingDate: data.closingDate ? new Date(data.closingDate) : null,
          });
          this.jobVacancyForm.get('status')?.enable();
        } else {
          console.error('Error loading job vacancy:', response?.decentMessage);
          this.router.navigate(['/job-vacancy/job-vacancy-list']);
        }
      },
      error: () => {
        this.router.navigate(['/job-vacancy/job-vacancy-list']);
      },
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      {
        title: 'Recruitment',
        icon: 'fa-solid fa-briefcase',
        href: '/job-vacancy/job-vacancy-list',
      },
      {
        title: 'Job Vacancies',
        icon: 'fa-solid fa-list',
        href: '/job-vacancy/job-vacancy-list',
      },
      {
        title: this.isEditMode ? 'Update Job Vacancy' : 'Add Job Vacancy',
        icon: 'fa-solid fa-edit',
        href: '/job-vacancy/manage-job-vacancy',
      },
    ]);
  }

  private initForm(): void {
    this.jobVacancyForm = this.fb.group({
      hiringPipelineId: [null, [Validators.required]],
      title: [null, [Validators.required, Validators.maxLength(200), this.noWhitespaceOnly.bind(this)]],
      description: [null],
      requirements: [null],
      numberOfPositions: [1, [Validators.required, Validators.min(1)]],
      employmentType: [null, Validators.required],
      location: [null, [Validators.maxLength(200)]],
      circularType: ['Both', Validators.required],
      minSalary: [null, [Validators.min(0)]],
      maxSalary: [null, [Validators.min(0)]],
      postingDate: [null],
      closingDate: [null],
      minAge: [null, [Validators.min(0)]],
      maxAge: [null, [Validators.min(0)]],
      minEducationLevel: [null],
      minExperienceYears: [null, [Validators.min(0)]],
      requiredDistrict: [null, [Validators.maxLength(100)]],
      applicationFeeAmount: [null, [Validators.min(0)]],
      applicationFeeCurrency: [null, [Validators.maxLength(10)]],
      status: [{ value: null, disabled: true }],
    });

    this.jobVacancyForm.addValidators([this.dateRangeValidator.bind(this), this.ageRangeValidator.bind(this), this.salaryRangeValidator.bind(this), this.feeCurrencyRequiredValidator.bind(this)]);
  }

  private noWhitespaceOnly(control: AbstractControl): ValidationErrors | null {
    if (control.value && typeof control.value === 'string' && control.value.trim().length === 0) {
      return { whitespaceOnly: true };
    }
    return null;
  }

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup;
    const postingDate = form.get('postingDate')?.value;
    const closingDate = form.get('closingDate')?.value;

    if (postingDate && closingDate) {
      if (new Date(closingDate) <= new Date(postingDate)) {
        return { closingDateBeforePostingDate: true };
      }
    }
    return null;
  }

  private ageRangeValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup;
    const minAge = form.get('minAge')?.value;
    const maxAge = form.get('maxAge')?.value;

    if (minAge !== null && minAge !== undefined && maxAge !== null && maxAge !== undefined && +minAge > +maxAge) {
      return { ageRangeInvalid: true };
    }
    return null;
  }

  private salaryRangeValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup;
    const minSalary = form.get('minSalary')?.value;
    const maxSalary = form.get('maxSalary')?.value;

    if (minSalary !== null && minSalary !== undefined && maxSalary !== null && maxSalary !== undefined && +minSalary > +maxSalary) {
      return { salaryRangeInvalid: true };
    }
    return null;
  }

  private feeCurrencyRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup;
    const applicationFeeAmount = form.get('applicationFeeAmount')?.value;
    const applicationFeeCurrency = form.get('applicationFeeCurrency')?.value;

    if (applicationFeeAmount !== null && applicationFeeAmount !== undefined && applicationFeeAmount !== '' && !applicationFeeCurrency) {
      return { applicationFeeCurrencyRequired: true };
    }
    return null;
  }

  filterCurrency(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim().toLowerCase();
    this.currencySuggestions = this.currencyOptions.filter((c) => c.code.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)).map((c) => c.code);
  }

  getCurrencyName(code: string): string {
    return this.currencyOptions.find((c) => c.code === code?.toUpperCase())?.name || '';
  }

  get f() {
    return this.jobVacancyForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.jobVacancyForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.jobVacancyForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['whitespaceOnly']) return `${this.getFieldDisplayName(fieldName)} cannot be whitespace only`;
      if (field.errors['maxlength']) return `${this.getFieldDisplayName(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${this.getFieldDisplayName(fieldName)} must be ${field.errors['min'].min} or greater`;
      if (field.errors['max']) return `${this.getFieldDisplayName(fieldName)} cannot exceed ${field.errors['max'].max}`;
    }
    return '';
  }

  getFormErrorMessage(): string {
    if (!(this.jobVacancyForm.touched || this.formSubmitted)) return '';

    if (this.jobVacancyForm.errors?.['closingDateBeforePostingDate']) {
      return 'Closing date must be after the posting date';
    }
    if (this.jobVacancyForm.errors?.['ageRangeInvalid']) {
      return 'Minimum age must be less than or equal to maximum age';
    }
    if (this.jobVacancyForm.errors?.['salaryRangeInvalid']) {
      return 'Minimum salary must be less than or equal to maximum salary';
    }
    if (this.jobVacancyForm.errors?.['applicationFeeCurrencyRequired']) {
      return 'Application fee currency is required when an application fee amount is set';
    }
    return '';
  }

  hasFormError(): boolean {
    return !!this.jobVacancyForm.errors && (this.jobVacancyForm.touched || this.formSubmitted);
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      hiringPipelineId: 'Hiring Pipeline',
      title: 'Title',
      description: 'Description',
      requirements: 'Requirements',
      numberOfPositions: 'Number of Positions',
      employmentType: 'Employment Type',
      location: 'Location',
      circularType: 'Circular Type',
      minSalary: 'Minimum Salary',
      maxSalary: 'Maximum Salary',
      postingDate: 'Posting Date',
      closingDate: 'Closing Date',
      minAge: 'Minimum Age',
      maxAge: 'Maximum Age',
      minEducationLevel: 'Minimum Education Level',
      minExperienceYears: 'Minimum Experience (Years)',
      requiredDistrict: 'Required District',
      applicationFeeAmount: 'Application Fee Amount',
      applicationFeeCurrency: 'Application Fee Currency',
      status: 'Status',
    };
    return displayNames[fieldName] || fieldName;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.jobVacancyForm.invalid) {
      this.jobVacancyForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode && this.jobVacancyToEdit) {
      this.updateJobVacancy();
    } else {
      this.addJobVacancy();
    }
  }

  // Site/Department/Designation ID inputs were removed from this form; the backend still
  // requires a SiteId, so every vacancy created here is filed under this fixed default.
  private static readonly DEFAULT_SITE_ID = 1;

  private buildRequestPayload(): IJobVacancyCreateRequest {
    const formValue = { ...this.jobVacancyForm.getRawValue() };
    delete formValue.status;

    return {
      ...formValue,
      siteId: this.jobVacancyToEdit?.siteId ?? ManageJobVacancyComponent.DEFAULT_SITE_ID,
      postingDate: formValue.postingDate ? DateTimeUtility.formatDateForAPI(formValue.postingDate) : null,
      closingDate: formValue.closingDate ? DateTimeUtility.formatDateForAPI(formValue.closingDate) : null,
    };
  }

  addJobVacancy(): void {
    const newVacancy: IJobVacancyCreateRequest = this.buildRequestPayload();

    this.jobVacancyService.addJobVacancy(newVacancy).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          // Redirect into edit mode for the newly created vacancy so the attachments
          // section becomes available immediately, per EP-02 requirements.
          this.router.navigate(['/job-vacancy/manage-job-vacancy', response.content]);
        } else {
          console.error('Error creating job vacancy:', response?.decentMessage);
        }
      },
      error: (error) => {
        console.error('Error creating job vacancy:', error);
      },
    });
  }

  updateJobVacancy(): void {
    const formValue = this.buildRequestPayload();
    const updatedVacancy: IJobVacancyUpdateRequest = {
      ...formValue,
      jobPostingId: this.jobPostingId!,
      status: this.jobVacancyForm.getRawValue().status,
    };

    this.jobVacancyService.updateJobVacancy(this.jobPostingId!, updatedVacancy).subscribe({
      next: (response) => {
        if (response && !response.hasError) {
          this.router.navigate(['/job-vacancy/job-vacancy-list']);
        } else {
          console.error('Error updating job vacancy:', response?.decentMessage);
        }
      },
      error: (error) => {
        console.error('Error updating job vacancy:', error);
      },
    });
  }

  // ---- Attachments ----

  loadAttachments(jobPostingId: number): void {
    this.loadingAttachments = true;
    this.jobVacancyAttachmentService.list(jobPostingId).subscribe({
      next: (response) => {
        this.attachments = !response.hasError && response.content ? response.content : [];
        this.loadingAttachments = false;
      },
      error: () => {
        this.attachments = [];
        this.loadingAttachments = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.attachmentError = '';
    this.selectedFile = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  uploadAttachment(): void {
    if (!this.selectedFile || !this.jobPostingId) return;

    this.uploadingAttachment = true;
    this.attachmentError = '';
    this.jobVacancyAttachmentService.upload(this.jobPostingId, this.selectedFile).subscribe({
      next: (response) => {
        this.uploadingAttachment = false;
        if (response && !response.hasError) {
          this.selectedFile = null;
          if (this.attachmentFileInput) this.attachmentFileInput.nativeElement.value = '';
          this.loadAttachments(this.jobPostingId!);
        } else {
          this.attachmentError = response?.decentMessage || 'Failed to upload attachment';
        }
      },
      error: (error) => {
        this.uploadingAttachment = false;
        this.attachmentError = error?.error?.decentMessage || 'Failed to upload attachment';
      },
    });
  }

  deleteAttachment(attachment: IJobVacancyAttachmentResponse): void {
    if (!this.jobPostingId) return;
    this.jobVacancyAttachmentService.delete(this.jobPostingId, attachment.jobPostingAttachmentId).subscribe({
      next: () => {
        this.loadAttachments(this.jobPostingId!);
      },
      error: (error) => {
        console.error('Error deleting attachment:', error);
      },
    });
  }

  getAttachmentDownloadUrl(attachment: IJobVacancyAttachmentResponse): string {
    if (!attachment.downloadUrl) return '';
    if (/^https?:\/\//i.test(attachment.downloadUrl)) return attachment.downloadUrl;
    return `${Base_URL}${attachment.downloadUrl.startsWith('/') ? '' : '/'}${attachment.downloadUrl}`;
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  readonly JobStatusEnum = JobStatusEnum;
}
