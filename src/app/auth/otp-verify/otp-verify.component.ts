import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@core/services/misc/toast.service';

const RESEND_COOLDOWN_SECONDS = 30;

@Component({
  selector: 'app-otp-verify',
  templateUrl: './otp-verify.component.html',
  styleUrls: ['./otp-verify.component.scss'],
  standalone: false,
})
export class OtpVerifyComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isSubmitting = false;
  isResending = false;
  resendCooldown = 0;

  private challengeId = '';
  private returnUrl = '/dashboard';
  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  ngOnInit(): void {
    this.challengeId = this.route.snapshot.queryParamMap.get('challengeId') || '';
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';

    if (!this.challengeId) {
      this.router.navigateByUrl('/login');
    }
  }

  ngOnDestroy(): void {
    this.clearCooldown();
  }

  get code() {
    return this.form.get('code');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService.verifyOtp({ challengeId: this.challengeId, code: this.form.value.code }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.isSubmitting = false;
        const message = error?.error?.decentMessage || 'Incorrect or expired code.';
        this.toastService.error({ detail: message });

        // Locked/expired sessions can't be retried in place - send the candidate back to log in
        // again rather than leaving them stuck on a dead code-entry screen.
        if (error?.status === 401) {
          this.form.reset();
        }
      },
    });
  }

  onResend(): void {
    if (this.isResending || this.resendCooldown > 0) return;

    this.isResending = true;
    this.authService.resendOtp({ challengeId: this.challengeId }).subscribe({
      next: () => {
        this.isResending = false;
        this.toastService.success({ detail: 'A new code has been sent.' });
        this.startCooldown();
      },
      error: (error) => {
        this.isResending = false;
        const message = error?.error?.decentMessage || 'This login session has expired. Please log in again.';
        this.toastService.error({ detail: message });
        this.router.navigateByUrl('/login');
      },
    });
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
}
