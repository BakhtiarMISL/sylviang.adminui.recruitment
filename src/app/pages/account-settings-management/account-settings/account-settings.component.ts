import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BreadcrumbService } from '@app/@core/services';
import { AccountSettingsService } from '@app/@core/services/account-settings/account-settings.service';
import { IAccountSettingsResponse } from '@app/@core/interfaces/account-settings.interface';
import { Base_URL } from '@env/environment';

const PHOTO_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const PHOTO_MAX_SIZE_BYTES = 2 * 1024 * 1024;

@Component({
  selector: 'app-account-settings',
  standalone: false,
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
})
export class AccountSettingsComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private accountSettingsService: AccountSettingsService,
    private breadcrumbService: BreadcrumbService,
  ) {
    this.emailForm = this.fb.group({
      email: [null, [Validators.required, Validators.email, Validators.maxLength(200)]],
    });

    this.otpForm = this.fb.group({
      otpCode: [null, [Validators.required]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: [null, [Validators.required]],
      newPassword: [null, [Validators.required, Validators.minLength(8)]],
      confirmPassword: [null, [Validators.required]],
    });
    this.passwordForm.addValidators((control) => {
      const form = control as FormGroup;
      const newPassword = form.get('newPassword')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;
      return newPassword && confirmPassword && newPassword !== confirmPassword ? { passwordMismatch: true } : null;
    });
  }

  account: IAccountSettingsResponse | null = null;
  loading = true;
  loadError = '';

  emailForm: FormGroup;
  emailFormSubmitted = false;
  savingEmail = false;
  emailSaveError = '';
  emailSaveSuccess = false;

  // Two-step email change: request sends an OTP to the NEW address, confirm applies it.
  otpForm: FormGroup;
  otpFormSubmitted = false;
  awaitingOtp = false;
  pendingEmail = '';
  challengeId = '';
  otpExpiresAtUtc: string | null = null;
  confirmingOtp = false;
  otpError = '';

  passwordForm: FormGroup;
  passwordFormSubmitted = false;
  savingPassword = false;
  passwordSaveError = '';
  passwordSaveSuccess = false;

  photoError = '';
  uploadingPhoto = false;
  selectedPhotoName = '';

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([{ title: 'Account Settings', icon: 'fa-solid fa-user-gear', href: '/account-settings' }]);
    this.loadAccount();
  }

  loadAccount(): void {
    this.loading = true;
    this.loadError = '';
    this.accountSettingsService.getMyAccount().subscribe({
      next: (response) => {
        this.loading = false;
        if (response && !response.hasError && response.content) {
          this.account = response.content;
          this.emailForm.patchValue({ email: this.account.email });
        } else {
          this.loadError = response?.decentMessage || 'Failed to load account settings.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.loadError = error?.error?.decentMessage || 'Failed to load account settings.';
      },
    });
  }

  getPhotoUrl(): string {
    if (!this.account?.profilePhotoPath) return '';
    return `${Base_URL}${this.account.profilePhotoPath.startsWith('/') ? '' : '/'}${this.account.profilePhotoPath}`;
  }

  get ef() {
    return this.emailForm.controls;
  }

  get pf() {
    return this.passwordForm.controls;
  }

  hasEmailError(fieldName: string): boolean {
    const field = this.emailForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.emailFormSubmitted));
  }

  getEmailErrorMessage(fieldName: string): string {
    const field = this.emailForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Email is required';
      if (field.errors['email']) return 'Email must be a valid email address';
    }
    return '';
  }

  submitEmail(): void {
    this.emailFormSubmitted = true;
    this.emailSaveError = '';
    this.emailSaveSuccess = false;

    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const newEmail = this.emailForm.getRawValue().email;
    this.savingEmail = true;
    this.accountSettingsService.requestEmailChange({ newEmail }).subscribe({
      next: (response) => {
        this.savingEmail = false;
        if (response && !response.hasError && response.content) {
          this.pendingEmail = newEmail;
          this.challengeId = response.content.challengeId;
          this.otpExpiresAtUtc = response.content.expiresAtUtc;
          this.awaitingOtp = true;
          this.otpForm.reset();
          this.otpFormSubmitted = false;
          this.otpError = '';
        } else {
          this.emailSaveError = response?.decentMessage || 'Failed to start email change.';
        }
      },
      error: (error) => {
        this.savingEmail = false;
        this.emailSaveError = error?.error?.decentMessage || 'Failed to start email change.';
      },
    });
  }

  get of() {
    return this.otpForm.controls;
  }

  hasOtpError(): boolean {
    const field = this.otpForm.get('otpCode');
    return !!(field && field.invalid && (field.dirty || field.touched || this.otpFormSubmitted));
  }

  confirmEmailChange(): void {
    this.otpFormSubmitted = true;
    this.otpError = '';

    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.confirmingOtp = true;
    this.accountSettingsService.confirmEmailChange({ challengeId: this.challengeId, otpCode: this.otpForm.getRawValue().otpCode }).subscribe({
      next: (response) => {
        this.confirmingOtp = false;
        if (response && !response.hasError) {
          this.emailSaveSuccess = true;
          this.awaitingOtp = false;
          this.pendingEmail = '';
          this.loadAccount();
        } else {
          this.otpError = response?.decentMessage || 'Incorrect or expired code.';
        }
      },
      error: (error) => {
        this.confirmingOtp = false;
        this.otpError = error?.error?.decentMessage || 'Incorrect or expired code.';
      },
    });
  }

  cancelEmailChange(): void {
    this.awaitingOtp = false;
    this.pendingEmail = '';
    this.challengeId = '';
    this.otpForm.reset();
    this.otpFormSubmitted = false;
    this.otpError = '';
    if (this.account) {
      this.emailForm.patchValue({ email: this.account.email });
    }
  }

  hasPasswordError(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.passwordFormSubmitted));
  }

  getPasswordErrorMessage(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['minlength']) return `Must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  getPasswordFormError(): string {
    if (this.passwordForm.errors?.['passwordMismatch'] && (this.passwordForm.touched || this.passwordFormSubmitted)) {
      return 'New password and confirmation do not match';
    }
    return '';
  }

  submitPassword(): void {
    this.passwordFormSubmitted = true;
    this.passwordSaveError = '';
    this.passwordSaveSuccess = false;

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.savingPassword = true;
    const formValue = this.passwordForm.getRawValue();
    this.accountSettingsService.changePassword({ currentPassword: formValue.currentPassword, newPassword: formValue.newPassword }).subscribe({
      next: (response) => {
        this.savingPassword = false;
        if (response && !response.hasError) {
          this.passwordSaveSuccess = true;
          this.passwordForm.reset();
          this.passwordFormSubmitted = false;
        } else {
          this.passwordSaveError = response?.decentMessage || 'Failed to change password.';
        }
      },
      error: (error) => {
        this.savingPassword = false;
        this.passwordSaveError = error?.error?.decentMessage || 'Failed to change password. Check your current password.';
      },
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photoError = '';
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!PHOTO_ALLOWED_EXTENSIONS.includes(extension)) {
      this.photoError = `File must be one of: ${PHOTO_ALLOWED_EXTENSIONS.join(', ')}`;
      input.value = '';
      return;
    }

    if (file.size > PHOTO_MAX_SIZE_BYTES) {
      this.photoError = 'File size must not exceed 2MB';
      input.value = '';
      return;
    }

    this.selectedPhotoName = file.name;
    this.uploadingPhoto = true;
    this.accountSettingsService.uploadPhoto(file).subscribe({
      next: (response) => {
        this.uploadingPhoto = false;
        input.value = '';
        if (response && !response.hasError) {
          this.loadAccount();
        } else {
          this.photoError = response?.decentMessage || 'Failed to upload photo';
        }
      },
      error: (error) => {
        this.uploadingPhoto = false;
        input.value = '';
        this.photoError = error?.error?.decentMessage || 'Failed to upload photo';
      },
    });
  }

  deletePhoto(): void {
    this.accountSettingsService.deletePhoto().subscribe({
      next: () => this.loadAccount(),
      error: (error) => console.error('Error deleting photo:', error),
    });
  }
}
