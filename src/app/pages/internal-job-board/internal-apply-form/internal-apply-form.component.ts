import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IJobApplicationSubmitResponse } from '@app/@core/interfaces/recruitment-management/career-portal.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { InternalJobBoardService } from '@app/@core/services/recruitment/internal-job-board/internal-job-board.service';
import { RESUME_ALLOWED_EXTENSIONS, RESUME_MAX_SIZE_BYTES } from '../internal-job-board.constants';

@Component({
  selector: 'app-internal-apply-form',
  standalone: false,
  templateUrl: './internal-apply-form.component.html',
  styleUrl: './internal-apply-form.component.scss',
})
export class InternalApplyFormComponent implements OnInit {
  @Input() jobPostingId!: number;

  constructor(
    private fb: FormBuilder,
    private internalJobBoardService: InternalJobBoardService,
    private candidateProfileService: CandidateProfileService,
  ) {
    this.applyForm = this.fb.group({
      candidateName: [null, [Validators.required]],
      candidateEmail: [null, [Validators.required, Validators.email]],
      candidatePhone: [null],
      coverLetter: [null],
    });
  }

  // US-005 AC1: pre-fill from the logged-in candidate's own profile (Core-HR-populated for
  // internal candidates) instead of the blank manual-entry form used previously. Candidate can
  // still edit before submitting.
  ngOnInit(): void {
    this.candidateProfileService.getMyProfile().subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.applyForm.patchValue({
            candidateName: response.content.fullName,
            candidateEmail: response.content.email,
            candidatePhone: response.content.phone,
          });
        }
      },
    });
  }

  applyForm: FormGroup;
  formSubmitted = false;
  selectedFile: File | null = null;
  fileError = '';
  submitting = false;
  submitError = '';
  submitted = false;
  submitResult: IJobApplicationSubmitResponse | null = null;

  get f() {
    return this.applyForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.applyForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.applyForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['email']) return `${this.getFieldDisplayName(fieldName)} must be a valid email address`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      candidateName: 'Name',
      candidateEmail: 'Email',
      candidatePhone: 'Phone',
      coverLetter: 'Cover Letter',
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

    if (!RESUME_ALLOWED_EXTENSIONS.includes(extension)) {
      this.fileError = `Resume must be one of: ${RESUME_ALLOWED_EXTENSIONS.join(', ')}`;
      return;
    }

    if (file.size > RESUME_MAX_SIZE_BYTES) {
      this.fileError = 'Resume file size must not exceed 10MB';
      return;
    }

    this.selectedFile = file;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.submitError = '';

    if (!this.selectedFile) {
      this.fileError = 'Resume is required';
    }

    if (this.applyForm.invalid || !this.selectedFile) {
      this.applyForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    this.internalJobBoardService.apply(this.jobPostingId, this.applyForm.value, this.selectedFile).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response && !response.hasError && response.content) {
          this.submitted = true;
          this.submitResult = response.content;
        } else {
          this.submitError = response?.decentMessage || 'Failed to submit application. Please try again.';
        }
      },
      error: (error) => {
        this.submitting = false;
        if (error?.status === 409) {
          this.submitError = "You've already applied to this position with this email address.";
        } else {
          this.submitError = error?.error?.decentMessage || 'Failed to submit application. Please try again.';
        }
      },
    });
  }
}
