import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IRoleResponse } from '@core/interfaces/recruitment-management/access-control.interface';
import { RoleService } from '@core/services/recruitment/access-control/access-control.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-role-list',
  standalone: false,
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent implements OnInit {
  constructor(
    private roleService: RoleService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  roles: IRoleResponse[] = [];
  loading = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getAll().subscribe({
      next: (response) => {
        this.roles = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.roles = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteRole(role: IRoleResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete role: ${role.name}?`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.roleService.delete(role.roleId).subscribe({
          next: () => {
            this.loadRoles();
          },
          error: (error) => {
            console.error('Error deleting role:', error);
          },
        });
      },
    });
  }
}
