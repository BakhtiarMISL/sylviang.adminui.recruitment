import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@core/services/misc/toast.service';

function passwordsMatchValidator(): ValidatorFn {
  return (group): ValidationErrors | null => {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword ? { passwordMismatch: true } : null;
  };
}

@Component({
  selector: 'app-accept-invite',
  templateUrl: './accept-invite.component.html',
  styleUrls: ['./accept-invite.component.scss'],
  standalone: false,
})
export class AcceptInviteComponent implements OnInit {
  form: FormGroup;

  isSubmitting = false;
  isMissingChallenge = false;
  acceptSuccess = false;

  private challengeId = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
  ) {
    this.form = this.fb.group(
      {
        code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatchValidator() },
    );
  }

  ngOnInit(): void {
    this.challengeId = this.route.snapshot.queryParamMap.get('challengeId') ?? '';
    this.isMissingChallenge = !this.challengeId;
  }

  get code() {
    return this.form.get('code');
  }

  get newPassword() {
    return this.form.get('newPassword');
  }

  get confirmPassword() {
    return this.form.get('confirmPassword');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService
      .acceptInvite({
        challengeId: this.challengeId,
        otpCode: this.form.value.code,
        newPassword: this.form.value.newPassword,
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.acceptSuccess = true;
        },
        error: (error) => {
          this.isSubmitting = false;
          const message = error?.error?.decentMessage || 'Incorrect or expired code.';
          this.toastService.error({ detail: message });
        },
      });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
