import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@core/services/misc/toast.service';

const RESEND_COOLDOWN_SECONDS = 30;

function passwordsMatchValidator(): ValidatorFn {
  return (group): ValidationErrors | null => {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword ? { passwordMismatch: true } : null;
  };
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: false,
})
export class ForgotPasswordComponent implements OnDestroy {
  requestForm: FormGroup;
  resetForm: FormGroup;

  awaitingOtp = false;
  isSubmittingRequest = false;
  isSubmittingReset = false;
  isResending = false;
  resendCooldown = 0;
  resetSuccess = false;

  secondsRemaining = 0;
  isExpired = false;

  private challengeId = '';
  private otpExpiresAt: number | null = null;
  private cooldownTimer: ReturnType<typeof setInterval> | null = null;
  private expiryTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
  ) {
    this.requestForm = this.fb.group({
      username: ['', Validators.required],
    });

    this.resetForm = this.fb.group(
      {
        code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatchValidator() },
    );
  }

  ngOnDestroy(): void {
    this.clearCooldown();
    this.clearExpiryTimer();
  }

  get username() {
    return this.requestForm.get('username');
  }

  get code() {
    return this.resetForm.get('code');
  }

  get newPassword() {
    return this.resetForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

  get formattedTimeRemaining(): string {
    const minutes = Math.floor(this.secondsRemaining / 60);
    const seconds = this.secondsRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  submitRequest(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isSubmittingRequest = true;

    this.authService.forgotPassword({ username: this.requestForm.value.username }).subscribe({
      next: (response) => {
        this.isSubmittingRequest = false;
        if (response.content) {
          this.challengeId = response.content.challengeId;
          this.awaitingOtp = true;
          this.resetForm.reset();
          this.startExpiryCountdown(response.content.expiresAtUtc);
          this.toastService.success({ detail: 'If that account exists, a code has been sent to its email.' });
        }
      },
      error: (error) => {
        this.isSubmittingRequest = false;
        const message = error?.error?.decentMessage || 'Failed to start password reset.';
        this.toastService.error({ detail: message });
      },
    });
  }

  submitReset(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    if (this.isExpired) {
      this.toastService.error({ detail: 'This code has expired. Request a new one.' });
      return;
    }

    this.isSubmittingReset = true;

    this.authService
      .resetPassword({
        challengeId: this.challengeId,
        otpCode: this.resetForm.value.code,
        newPassword: this.resetForm.value.newPassword,
      })
      .subscribe({
        next: () => {
          this.isSubmittingReset = false;
          this.resetSuccess = true;
          this.awaitingOtp = false;
        },
        error: (error) => {
          this.isSubmittingReset = false;
          const message = error?.error?.decentMessage || 'Incorrect or expired code.';
          this.toastService.error({ detail: message });
        },
      });
  }

  onResend(): void {
    if (this.isResending || this.resendCooldown > 0) return;

    this.isResending = true;
    this.authService.forgotPassword({ username: this.requestForm.value.username }).subscribe({
      next: (response) => {
        this.isResending = false;
        this.toastService.success({ detail: 'A new code has been sent.' });
        this.startCooldown();
        if (response.content) {
          this.challengeId = response.content.challengeId;
          this.startExpiryCountdown(response.content.expiresAtUtc);
        }
      },
      error: (error) => {
        this.isResending = false;
        const message = error?.error?.decentMessage || 'Failed to resend the code.';
        this.toastService.error({ detail: message });
      },
    });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  private startCooldown(): void {
    this.resendCooldown = RESEND_COOLDOWN_SECONDS;
    this.clearCooldown();
    this.cooldownTimer = setInterval(() => {
      this.resendCooldown -= 1;
      if (this.resendCooldown <= 0) {
        this.clearCooldown();
      }
    }, 1000);
  }

  private clearCooldown(): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
      this.cooldownTimer = null;
    }
  }

  private startExpiryCountdown(expiresAtUtc: string): void {
    this.otpExpiresAt = new Date(expiresAtUtc).getTime();
    this.isExpired = false;
    this.clearExpiryTimer();
    this.tickExpiryCountdown();
    this.expiryTimer = setInterval(() => this.tickExpiryCountdown(), 1000);
  }

  private tickExpiryCountdown(): void {
    if (this.otpExpiresAt === null) return;

    this.secondsRemaining = Math.max(0, Math.round((this.otpExpiresAt - Date.now()) / 1000));
    if (this.secondsRemaining === 0) {
      this.isExpired = true;
      this.clearExpiryTimer();
    }
  }

  private clearExpiryTimer(): void {
    if (this.expiryTimer) {
      clearInterval(this.expiryTimer);
      this.expiryTimer = null;
    }
  }
}
