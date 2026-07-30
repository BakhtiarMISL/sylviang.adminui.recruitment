import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { IRoleCreateRequest, IRoleUpdateRequest, PermissionActionEnum } from '@core/interfaces/recruitment-management/access-control.interface';
import { RoleService } from '@core/services/recruitment/access-control/access-control.service';
import { buildEmptyMatrix, IPermissionMatrixRow, matrixFromGrants, matrixToGrants, PermissionActions } from './role-form.component.constants';

@Component({
  selector: 'app-role-form',
  standalone: false,
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss',
})
export class RoleFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  form!: FormGroup;
  matrix: IPermissionMatrixRow[] = buildEmptyMatrix();
  actions = PermissionActions;

  formSubmitted = false;
  isEditMode = false;
  isSystemRole = false;
  roleId: number | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(100)]],
    });

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.isEditMode = !!idParam;
      this.roleId = idParam ? +idParam : null;

      if (this.roleId) {
        this.loadRole(this.roleId);
      }

      this.setBreadcrumbs();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/access-control/role-list' },
      { title: 'Roles', icon: 'fa-solid fa-user-shield', href: '/access-control/role-list' },
      { title: this.isEditMode ? 'Edit Role' : 'Add Role', icon: 'fa-solid fa-edit', href: '/access-control/manage-role' },
    ]);
  }

  private loadRole(id: number): void {
    this.roleService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.isSystemRole = response.content.isSystemRole;
          this.form.patchValue({ name: response.content.name });
          this.matrix = matrixFromGrants(response.content.permissions);
          if (this.isSystemRole) {
            this.form.disable();
          }
        } else {
          this.router.navigate(['/access-control/role-list']);
        }
      },
      error: () => {
        this.router.navigate(['/access-control/role-list']);
      },
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  toggleGrant(row: IPermissionMatrixRow, action: PermissionActionEnum, checked: boolean): void {
    row.grants[action] = checked;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const permissions = matrixToGrants(this.matrix);

    if (this.isEditMode && this.roleId) {
      const request: IRoleUpdateRequest = { name: this.form.value.name, permissions };
      this.roleService.update(this.roleId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/access-control/role-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update role';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update role';
        },
      });
    } else {
      const request: IRoleCreateRequest = { name: this.form.value.name, permissions };
      this.roleService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/access-control/role-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create role';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create role';
        },
      });
    }
  }
}
