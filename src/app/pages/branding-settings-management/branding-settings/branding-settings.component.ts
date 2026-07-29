import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BreadcrumbService } from '@app/@core/services';
import { CompanyBrandingService } from '@core/services/recruitment/company-branding/company-branding.service';
import { saveFileResponse } from '@core/services/recruitment/cv-bank/cv-bank.service';
import { Base_URL } from '@env/environment';

const LOGO_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg'];
const LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024;

@Component({
  selector: 'app-branding-settings',
  standalone: false,
  templateUrl: './branding-settings.component.html',
  styleUrl: './branding-settings.component.scss',
})
export class BrandingSettingsComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private companyBrandingService: CompanyBrandingService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  settingsForm!: FormGroup;
  loading = true;
  saving = false;
  previewing = false;
  uploadingLogo = false;
  errorMessage = '';
  successMessage = '';
  logoError = '';

  logoFilePath: string | null = null;

  readonly borderStyleOptions = [
    { label: 'None', value: 'None' },
    { label: 'Solid', value: 'Solid' },
    { label: 'Double', value: 'Double' },
    { label: 'Rounded', value: 'Rounded' },
  ];

  readonly fontFamilyOptions = [
    { label: 'Helvetica', value: 'Helvetica' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Calibri', value: 'Calibri' },
  ];

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      companyName: [''],
      addressLine: [''],
      phone: [''],
      email: [''],
      website: [''],
      primaryColor: ['#7A2E2E'],
      secondaryColor: ['#1F2937'],
      accentColor: ['#DC2626'],
      fontFamily: ['Helvetica'],
      borderStyle: ['Solid'],
      backgroundWatermarkEnabled: [false],
      watermarkOpacity: [15],
      showPageNumbers: [true],
    });

    this.breadcrumbService.setBreadcrumbs([{ title: 'Branding Settings', icon: 'fa-solid fa-palette', href: '/branding-settings' }]);

    this.loadSettings();
  }

  get f() {
    return this.settingsForm.controls;
  }

  get logoUrl(): string {
    if (!this.logoFilePath) return '';
    return `${Base_URL}${this.logoFilePath.startsWith('/') ? '' : '/'}${this.logoFilePath}`;
  }

  private loadSettings(): void {
    this.loading = true;
    this.companyBrandingService.getSettings().subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.settingsForm.patchValue(response.content);
          this.logoFilePath = response.content.logoFilePath;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load branding settings.';
        this.loading = false;
      },
    });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.logoError = '';
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!LOGO_ALLOWED_EXTENSIONS.includes(extension)) {
      this.logoError = `File must be one of: ${LOGO_ALLOWED_EXTENSIONS.join(', ')}`;
      input.value = '';
      return;
    }
    if (file.size > LOGO_MAX_SIZE_BYTES) {
      this.logoError = 'File must be 2MB or smaller.';
      input.value = '';
      return;
    }

    this.uploadingLogo = true;
    this.companyBrandingService.uploadLogo(file).subscribe({
      next: (response) => {
        this.uploadingLogo = false;
        input.value = '';
        if (response && !response.hasError && response.content) {
          this.logoFilePath = response.content;
          this.successMessage = 'Logo uploaded.';
        } else {
          this.logoError = response?.decentMessage || 'Failed to upload logo.';
        }
      },
      error: (error) => {
        this.uploadingLogo = false;
        input.value = '';
        this.logoError = error?.error?.decentMessage || 'Failed to upload logo.';
      },
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.saving = true;

    this.companyBrandingService.updateSettings(this.settingsForm.value).subscribe({
      next: (response) => {
        this.saving = false;
        if (response && !response.hasError) {
          this.successMessage = 'Branding settings saved.';
        } else {
          this.errorMessage = response?.decentMessage || 'Failed to save branding settings.';
        }
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = error?.error?.decentMessage || 'Failed to save branding settings.';
      },
    });
  }

  onPreview(): void {
    this.errorMessage = '';
    this.previewing = true;

    this.companyBrandingService.previewPdf(this.settingsForm.value).subscribe({
      next: (response) => {
        this.previewing = false;
        saveFileResponse(response, 'branding-preview.pdf');
      },
      error: () => {
        this.previewing = false;
        this.errorMessage = 'Failed to generate preview PDF.';
      },
    });
  }
}
