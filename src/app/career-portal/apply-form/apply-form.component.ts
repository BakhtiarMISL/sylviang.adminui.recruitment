import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IJobApplicationSubmitResponse, IJobEligibilityResponse } from '@app/@core/interfaces/recruitment-management/career-portal.interface';
import { CareerPortalService } from '@app/@core/services/recruitment/career-portal/career-portal.service';
import { PaymentService } from '@app/@core/services/recruitment/payment/payment.service';
import { RESUME_ALLOWED_EXTENSIONS, RESUME_MAX_SIZE_BYTES } from '../career-portal.constants';

@Component({
  selector: 'app-apply-form',
  standalone: false,
  templateUrl: './apply-form.component.html',
  styleUrl: './apply-form.component.scss',
})
export class ApplyFormComponent {
  @Input() jobPostingId!: number;
  @Input() eligibilityResult: IJobEligibilityResponse | null = null;
  acknowledgedIneligibility = false;

  /** US-024 AC4: ineligible candidates can still apply, but must re-acknowledge the warning first. */
  get needsAcknowledgement(): boolean {
    return !!this.eligibilityResult && !this.eligibilityResult.isEligible;
  }

  constructor(
    private fb: FormBuilder,
    private careerPortalService: CareerPortalService,
    private paymentService: PaymentService,
  ) {
    this.applyForm = this.fb.group({
      candidateName: [null, [Validators.required]],
      candidateEmail: [null, [Validators.required, Validators.email]],
      candidatePhone: [null],
      coverLetter: [null],
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
  // EP-17: true when the application was saved but the SSLCommerz redirect couldn't be started
  // (gateway outage at submit time) - the candidate can retry from here.
  paymentPending = false;
  retryingPayment = false;
  retryError = '';

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

    if (this.applyForm.invalid || !this.selectedFile || (this.needsAcknowledgement && !this.acknowledgedIneligibility)) {
      this.applyForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    this.careerPortalService.apply(this.jobPostingId, this.applyForm.value, this.selectedFile).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response && !response.hasError && response.content) {
          this.submitResult = response.content;
          if (this.submitResult.paymentRequired && this.submitResult.paymentRedirectUrl) {
            window.location.href = this.submitResult.paymentRedirectUrl;
            return;
          }
          this.submitted = true;
          this.paymentPending = !!this.submitResult.paymentRequired;
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

  retryPayment(): void {
    if (!this.submitResult) return;
    this.retryingPayment = true;
    this.retryError = '';

    this.paymentService.initiatePayment(this.submitResult.jobApplicationId).subscribe({
      next: (response) => {
        this.retryingPayment = false;
        if (response && !response.hasError && response.content?.success && response.content.gatewayRedirectUrl) {
          window.location.href = response.content.gatewayRedirectUrl;
        } else {
          this.retryError = response?.content?.failureReason || response?.decentMessage || 'Could not start payment. Please try again.';
        }
      },
      error: (error) => {
        this.retryingPayment = false;
        this.retryError = error?.error?.decentMessage || 'Could not start payment. Please try again.';
      },
    });
  }
}
