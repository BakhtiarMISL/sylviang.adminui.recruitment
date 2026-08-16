import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { AuthService } from '@core/services/auth/auth.service';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { IRoleResponse, IUserAccountCreateRequest, IUserAccountUpdateRequest } from '@core/interfaces/recruitment-management/access-control.interface';
import { ICompanyResponse } from '@core/interfaces/recruitment-management/company.interface';
import { RoleService, UserAccountService } from '@core/services/recruitment/access-control/access-control.service';
import { CompanyService } from '@core/services/recruitment/company/company.service';

@Component({
  selector: 'app-user-account-form',
  standalone: false,
  templateUrl: './user-account-form.component.html',
  styleUrl: './user-account-form.component.scss',
})
export class UserAccountFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private userAccountService: UserAccountService,
    private roleService: RoleService,
    private companyService: CompanyService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  form!: FormGroup;
  roleOptions: IRoleResponse[] = [];
  companyOptions: ICompanyResponse[] = [];
  formSubmitted = false;
  isEditMode = false;
  userAccountId: number | null = null;
  errorMessage = '';
  submitting = false;

  get isSuperAdmin(): boolean {
    return this.authService.getRole() === UserRoleEnum.SuperAdmin;
  }

  // A caller who isn't SuperAdmin (a Company Admin inviting HR) is locked to their own company -
  // the backend enforces this regardless, but there's no point showing a selector they can't use.
  get showCompanySelector(): boolean {
    return this.isSuperAdmin && !this.isSelectedRolesSuperAdminOnly();
  }

  get companyRequired(): boolean {
    return !this.isEditMode && !this.isSelectedRolesSuperAdminOnly();
  }

  private isSelectedRolesSuperAdminOnly(): boolean {
    const selectedIds: number[] = this.form?.get('roleIds')?.value ?? [];
    if (selectedIds.length === 0) return false;

    return selectedIds.every((id) => this.roleOptions.find((r) => r.roleId === id)?.name === 'SuperAdmin');
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.isEditMode = !!idParam;
      this.userAccountId = idParam ? +idParam : null;
      this.buildForm();
      this.loadRoleOptions();

      if (this.isSuperAdmin) {
        this.loadCompanyOptions();
      }

      if (this.userAccountId) {
        this.loadAccount(this.userAccountId);
      }

      this.setBreadcrumbs();
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      email: [null, this.isEditMode ? [] : [Validators.required, Validators.email]],
      fullName: [null, [Validators.required, Validators.maxLength(200)]],
      roleIds: [[], [Validators.required]],
      companyId: [null],
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/access-control/user-account-list' },
      { title: 'User Accounts', icon: 'fa-solid fa-users', href: '/access-control/user-account-list' },
      { title: this.isEditMode ? 'Edit User' : 'Invite User', icon: 'fa-solid fa-edit', href: '/access-control/manage-user-account' },
    ]);
  }

  private loadRoleOptions(): void {
    this.roleService.getAll().subscribe({
      next: (response) => {
        const roles = !response.hasError && response.content ? response.content : [];
        // Candidate is self-service only (register/apply flow) - never assignable to a staff
        // user account through this screen. Backend rejects it too (UserAccountService).
        this.roleOptions = roles.filter((role) => role.name !== 'Candidate');
      },
      error: () => {
        this.roleOptions = [];
      },
    });
  }

  private loadCompanyOptions(): void {
    this.companyService.getAll().subscribe({
      next: (response) => {
        this.companyOptions = !response.hasError && response.content ? response.content : [];
      },
      error: () => {
        this.companyOptions = [];
      },
    });
  }

  private loadAccount(id: number): void {
    this.userAccountService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.form.patchValue({
            email: response.content.email,
            fullName: response.content.fullName,
            roleIds: response.content.roleIds,
            companyId: response.content.companyId,
          });
        } else {
          this.router.navigate(['/access-control/user-account-list']);
        }
      },
      error: () => {
        this.router.navigate(['/access-control/user-account-list']);
      },
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
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

    if (this.showCompanySelector && this.companyRequired && !this.form.value.companyId) {
      this.errorMessage = 'A company must be selected.';
      return;
    }

    this.submitting = true;

    if (this.isEditMode && this.userAccountId) {
      const request: IUserAccountUpdateRequest = {
        fullName: this.form.value.fullName,
        roleIds: this.form.value.roleIds,
      };
      this.userAccountService.update(this.userAccountId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/access-control/user-account-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update user account';
            this.submitting = false;
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update user account';
          this.submitting = false;
        },
      });
    } else {
      const request: IUserAccountCreateRequest = {
        email: this.form.value.email,
        fullName: this.form.value.fullName,
        roleIds: this.form.value.roleIds,
        companyId: this.isSuperAdmin ? this.form.value.companyId : null,
      };
      this.userAccountService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/access-control/user-account-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to invite user';
            this.submitting = false;
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to invite user';
          this.submitting = false;
        },
      });
    }
  }
}
