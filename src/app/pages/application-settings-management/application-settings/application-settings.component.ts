import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BreadcrumbService } from '@app/@core/services';
import { ApplicationSettingService } from '@app/@core/services/recruitment/application-setting/application-setting.service';

@Component({
  selector: 'app-application-settings',
  standalone: false,
  templateUrl: './application-settings.component.html',
  styleUrl: './application-settings.component.scss',
})
export class ApplicationSettingsComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private applicationSettingService: ApplicationSettingService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  settingsForm!: FormGroup;
  loading = true;
  saving = false;
  formSubmitted = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      minimumProfileCompletenessPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      hrNotificationEmail: [null, [Validators.email]],
    });

    this.breadcrumbService.setBreadcrumbs([{ title: 'Application Settings', icon: 'fa-solid fa-sliders', href: '/application-settings' }]);

    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading = true;
    this.applicationSettingService.getSettings().subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.settingsForm.patchValue({
            minimumProfileCompletenessPercentage: response.content.minimumProfileCompletenessPercentage,
            hrNotificationEmail: response.content.hrNotificationEmail,
          });
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load application settings.';
        this.loading = false;
      },
    });
  }

  get f() {
    return this.settingsForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.settingsForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.applicationSettingService.updateSettings(this.settingsForm.value).subscribe({
      next: (response) => {
        this.saving = false;
        if (response && !response.hasError) {
          this.successMessage = 'Application settings saved.';
          this.settingsForm.markAsPristine();
        } else {
          this.errorMessage = response?.decentMessage || 'Failed to save application settings.';
        }
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = error?.error?.decentMessage || 'Failed to save application settings.';
      },
    });
  }
}
