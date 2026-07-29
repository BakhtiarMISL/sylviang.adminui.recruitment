import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@core/services/misc/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent {
  form: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get username() {
    return this.form.get('username');
  }

  get password() {
    return this.form.get('password');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService.login(this.form.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';

        // EP-09 Feature 2: candidate login gated by OTP - no token issued yet, route to the
        // code-entry screen instead of the dashboard.
        if (response.content?.requiresOtp && response.content.challengeId) {
          this.router.navigate(['/login/verify-otp'], {
            queryParams: { challengeId: response.content.challengeId, returnUrl },
          });
          return;
        }

        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.isSubmitting = false;
        const message = error?.error?.decentMessage || 'Invalid username or password.';
        this.toastService.error({ detail: message });
      },
    });
  }
}
