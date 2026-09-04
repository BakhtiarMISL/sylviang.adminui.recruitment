import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { ICompanyCreateRequest, ICompanyUpdateRequest } from '@core/interfaces/recruitment-management/company.interface';
import { CompanyService } from '@core/services/recruitment/company/company.service';
import { ToastService } from '@core/services/misc/toast.service';
import { Base_URL } from '@env/environment';

const LOGO_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg'];
const LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024;

@Component({
  selector: 'app-company-form',
  standalone: false,
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.scss',
})
export class CompanyFormComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private toastService: ToastService,
  ) {}

  form!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  companyId: number | null = null;
  errorMessage = '';
  submitting = false;

  logoPath: string | null = null;
  uploadingLogo = false;
  logoError = '';

  // Create mode: no companyId exists yet to upload against, so the picked file is held here and
  // previewed locally (object URL) until the company itself is saved - then onSubmit uploads it
  // as a follow-up call using the new id, same endpoint Edit mode calls directly.
  pendingLogoFile: File | null = null;
  private pendingLogoPreviewUrl: string | null = null;

  get logoUrl(): string {
    if (this.pendingLogoPreviewUrl) return this.pendingLogoPreviewUrl;
    if (!this.logoPath) return '';
    return `${Base_URL}${this.logoPath.startsWith('/') ? '' : '/'}${this.logoPath}`;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.isEditMode = !!idParam;
      this.companyId = idParam ? +idParam : null;
      this.buildForm();

      if (this.companyId) {
        this.loadCompany(this.companyId);
      }

      this.setBreadcrumbs();
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(200)]],
      email: [null, [Validators.email]],
      phone: [null, [Validators.maxLength(50)]],
      address: [null, [Validators.maxLength(500)]],
      website: [null, [Validators.maxLength(200)]],
      industry: [null, [Validators.maxLength(100)]],
      tradeLicenseNumber: [null, [Validators.maxLength(100)]],
      binNumber: [null, [Validators.maxLength(100)]],
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/company-management/company-list' },
      { title: 'Companies', icon: 'fa-solid fa-building', href: '/company-management/company-list' },
      { title: this.isEditMode ? 'Edit Company' : 'Create Company', icon: 'fa-solid fa-edit', href: '/company-management/manage-company' },
    ]);
  }

  private loadCompany(id: number): void {
    this.companyService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.form.patchValue({
            name: response.content.name,
            email: response.content.email,
            phone: response.content.phone,
            address: response.content.address,
            website: response.content.website,
            industry: response.content.industry,
            tradeLicenseNumber: response.content.tradeLicenseNumber,
            binNumber: response.content.binNumber,
          });
          this.logoPath = response.content.logoUrl;
        } else {
          this.router.navigate(['/company-management/company-list']);
        }
      },
      error: () => {
        this.router.navigate(['/company-management/company-list']);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.pendingLogoPreviewUrl) URL.revokeObjectURL(this.pendingLogoPreviewUrl);
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
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

    if (this.isEditMode && this.companyId) {
      this.uploadingLogo = true;
      this.companyService.uploadLogo(this.companyId, file).subscribe({
        next: (response) => {
          this.uploadingLogo = false;
          input.value = '';
          if (response && !response.hasError && response.content) {
            this.loadCompany(this.companyId!);
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
      return;
    }

    // Create mode: nothing to upload against yet - hold the file and show a local preview;
    // onSubmit uploads it right after the company is saved and gets its real id.
    if (this.pendingLogoPreviewUrl) URL.revokeObjectURL(this.pendingLogoPreviewUrl);
    this.pendingLogoFile = file;
    this.pendingLogoPreviewUrl = URL.createObjectURL(file);
  }

  private uploadPendingLogo(newCompanyId: number): void {
    const file = this.pendingLogoFile;
    if (!file) {
      this.router.navigate(['/company-management/company-list']);
      return;
    }

    this.companyService.uploadLogo(newCompanyId, file, true).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.toastService.success({ detail: 'Company created and logo uploaded.' });
          this.router.navigate(['/company-management/company-list']);
        } else {
          this.toastService.error({ detail: response?.decentMessage || 'Company created, but the logo failed to upload. You can retry it here.' });
          this.router.navigate(['/company-management/manage-company', newCompanyId]);
        }
      },
      error: (error) => {
        this.toastService.error({ detail: error?.error?.decentMessage || 'Company created, but the logo failed to upload. You can retry it here.' });
        this.router.navigate(['/company-management/manage-company', newCompanyId]);
      },
    });
  }

  onSubmit(): void {
    if (this.submitting) {
      return;
    }

    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const request: ICompanyCreateRequest | ICompanyUpdateRequest = {
      name: this.form.value.name,
      email: this.form.value.email,
      phone: this.form.value.phone,
      address: this.form.value.address,
      website: this.form.value.website,
      industry: this.form.value.industry,
      tradeLicenseNumber: this.form.value.tradeLicenseNumber,
      binNumber: this.form.value.binNumber,
    };

    if (this.isEditMode && this.companyId) {
      this.companyService.update(this.companyId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/company-management/company-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update company';
            this.submitting = false;
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update company';
          this.submitting = false;
        },
      });
    } else {
      this.companyService.create(request, !!this.pendingLogoFile).subscribe({
        next: (response) => {
          if (response && !response.hasError && response.content) {
            this.uploadPendingLogo(response.content);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create company';
            this.submitting = false;
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create company';
          this.submitting = false;
        },
      });
    }
  }
}
