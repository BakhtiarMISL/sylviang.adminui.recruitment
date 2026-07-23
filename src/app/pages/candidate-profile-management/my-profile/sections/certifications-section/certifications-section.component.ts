import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { ICandidateCertificationResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { DateTimeUtility } from '@app/@core/utils/date-time.utility';
import { Base_URL } from '@env/environment';
import { Observable } from 'rxjs';

const CERTIFICATE_ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const CERTIFICATE_MAX_SIZE_BYTES = 10 * 1024 * 1024;

@Component({
  selector: 'app-certifications-section',
  standalone: false,
  templateUrl: './certifications-section.component.html',
  styleUrl: './certifications-section.component.scss',
})
export class CertificationsSectionComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private candidateProfileService: CandidateProfileService,
  ) {
    this.form = this.fb.group({
      certificationName: [null, [Validators.required, Validators.maxLength(200)]],
      issuingOrganization: [null, [Validators.maxLength(200)]],
      issueDate: [null],
      expiryDate: [null],
      credentialId: [null, [Validators.maxLength(100)]],
    });

    this.form.addValidators(this.expiryDateValidator.bind(this));
  }

  form: FormGroup;
  formSubmitted = false;
  saving = false;
  saveError = '';
  fileError = '';
  selectedFile: File | null = null;

  items: ICandidateCertificationResponse[] = [];
  loading = false;
  editingId: number | null = null;
  showForm = false;

  ngOnInit(): void {
    this.loadCertifications();
  }

  loadCertifications(): void {
    this.loading = true;
    this.candidateProfileService.getCertifications().subscribe({
      next: (response) => {
        this.items = !response.hasError && response.content ? response.content : [];
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      },
    });
  }

  private expiryDateValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup;
    const issueDate = form.get('issueDate')?.value;
    const expiryDate = form.get('expiryDate')?.value;

    if (issueDate && expiryDate && new Date(expiryDate) <= new Date(issueDate)) {
      return { expiryDateBeforeIssueDate: true };
    }
    return null;
  }

  get f() {
    return this.form.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['maxlength']) return `${this.getFieldDisplayName(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  getFormErrorMessage(): string {
    if (this.form.errors?.['expiryDateBeforeIssueDate']) return 'Expiry date must be after issue date';
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      certificationName: 'Certification Name',
      issuingOrganization: 'Issuing Organization',
      issueDate: 'Issue Date',
      expiryDate: 'Expiry Date',
      credentialId: 'Credential ID',
    };
    return displayNames[fieldName] || fieldName;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError = '';
    this.selectedFile = null;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!CERTIFICATE_ALLOWED_EXTENSIONS.includes(extension)) {
      this.fileError = `Certificate file must be one of: ${CERTIFICATE_ALLOWED_EXTENSIONS.join(', ')}`;
      input.value = '';
      return;
    }

    if (file.size > CERTIFICATE_MAX_SIZE_BYTES) {
      this.fileError = 'Certificate file size must not exceed 10MB';
      input.value = '';
      return;
    }

    this.selectedFile = file;
  }

  startAdd(): void {
    this.editingId = null;
    this.formSubmitted = false;
    this.saveError = '';
    this.fileError = '';
    this.selectedFile = null;
    this.form.reset();
    this.showForm = true;
  }

  startEdit(item: ICandidateCertificationResponse): void {
    this.editingId = item.candidateCertificationId;
    this.formSubmitted = false;
    this.saveError = '';
    this.fileError = '';
    this.selectedFile = null;
    this.form.patchValue({
      ...item,
      issueDate: item.issueDate ? new Date(item.issueDate) : null,
      expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
    });
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.form.reset();
    this.selectedFile = null;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.saveError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formValue = this.form.getRawValue();
    const request = {
      certificationName: formValue.certificationName,
      issuingOrganization: formValue.issuingOrganization,
      issueDate: formValue.issueDate ? DateTimeUtility.formatDateForAPI(formValue.issueDate) : null,
      expiryDate: formValue.expiryDate ? DateTimeUtility.formatDateForAPI(formValue.expiryDate) : null,
      credentialId: formValue.credentialId,
    };

    const request$: Observable<ApiResponse<number | void>> = this.editingId
      ? this.candidateProfileService.updateCertification(this.editingId, request, this.selectedFile)
      : this.candidateProfileService.addCertification(request, this.selectedFile);

    request$.subscribe({
      next: (response) => {
        this.saving = false;
        if (response && !response.hasError) {
          this.showForm = false;
          this.form.reset();
          this.selectedFile = null;
          this.loadCertifications();
          this.saved.emit();
        } else {
          this.saveError = response?.decentMessage || 'Failed to save certification.';
        }
      },
      error: (error) => {
        this.saving = false;
        this.saveError = error?.error?.decentMessage || 'Failed to save certification.';
      },
    });
  }

  delete(item: ICandidateCertificationResponse): void {
    this.candidateProfileService.deleteCertification(item.candidateCertificationId).subscribe({
      next: () => {
        this.loadCertifications();
        this.saved.emit();
      },
      error: (error) => {
        console.error('Error deleting certification:', error);
      },
    });
  }

  getCertificateDownloadUrl(item: ICandidateCertificationResponse): string {
    if (!item.certificateFilePath) return '';
    return `${Base_URL}${item.certificateFilePath.startsWith('/') ? '' : '/'}${item.certificateFilePath}`;
  }
}
