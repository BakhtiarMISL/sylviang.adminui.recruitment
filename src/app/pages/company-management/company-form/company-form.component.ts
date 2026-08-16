import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { ICompanyCreateRequest, ICompanyUpdateRequest } from '@core/interfaces/recruitment-management/company.interface';
import { CompanyService } from '@core/services/recruitment/company/company.service';

@Component({
  selector: 'app-company-form',
  standalone: false,
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.scss',
})
export class CompanyFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  form!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  companyId: number | null = null;
  errorMessage = '';
  submitting = false;

  logoUrl: string | null = null;
  uploadingLogo = false;

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
          });
          this.logoUrl = response.content.logoUrl;
        } else {
          this.router.navigate(['/company-management/company-list']);
        }
      },
      error: () => {
        this.router.navigate(['/company-management/company-list']);
      },
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  onLogoSelected(event: Event): void {
    if (!this.companyId) return;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingLogo = true;
    this.companyService.uploadLogo(this.companyId, file).subscribe({
      next: (response) => {
        this.uploadingLogo = false;
        if (response && !response.hasError && response.content) {
          this.loadCompany(this.companyId!);
        }
      },
      error: () => {
        this.uploadingLogo = false;
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
      this.companyService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/company-management/company-list']);
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
