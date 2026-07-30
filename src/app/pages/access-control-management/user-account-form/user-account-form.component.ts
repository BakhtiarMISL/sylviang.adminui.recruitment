import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { IRoleResponse, IUserAccountCreateRequest, IUserAccountUpdateRequest } from '@core/interfaces/recruitment-management/access-control.interface';
import { RoleService, UserAccountService } from '@core/services/recruitment/access-control/access-control.service';

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
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  form!: FormGroup;
  roleOptions: IRoleResponse[] = [];
  formSubmitted = false;
  isEditMode = false;
  userAccountId: number | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.isEditMode = !!idParam;
      this.userAccountId = idParam ? +idParam : null;
      this.buildForm();
      this.loadRoleOptions();

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
      password: [null, this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]],
      roleIds: [[], [Validators.required]],
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
        this.roleOptions = !response.hasError && response.content ? response.content : [];
      },
      error: () => {
        this.roleOptions = [];
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
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

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
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update user account';
        },
      });
    } else {
      const request: IUserAccountCreateRequest = {
        email: this.form.value.email,
        fullName: this.form.value.fullName,
        password: this.form.value.password,
        roleIds: this.form.value.roleIds,
      };
      this.userAccountService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/access-control/user-account-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to invite user';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to invite user';
        },
      });
    }
  }
}
