import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@core/services/misc/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: false,
})
export class RegisterComponent {
  form: FormGroup;
  isSubmitting = false;
  registered = false;
  requiresEmailVerification = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    const queryParams = this.route.snapshot.queryParamMap;
    const fullName = queryParams.get('fullName');
    const email = queryParams.get('email');
    if (fullName || email) {
      this.form.patchValue({ fullName: fullName ?? '', email: email ?? '' });
    }
  }

  get fullName() {
    return this.form.get('fullName');
  }

  get email() {
    return this.form.get('email');
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

    this.authService.register(this.form.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.registered = true;
        this.requiresEmailVerification = !!response.content?.requiresEmailVerification;
      },
      error: (error) => {
        this.isSubmitting = false;
        const message = error?.error?.decentMessage || 'Registration failed. Please try again.';
        this.toastService.error({ detail: message });
      },
    });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
