import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { UserAccountListComponent } from './user-account-list/user-account-list.component';
import { UserAccountFormComponent } from './user-account-form/user-account-form.component';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleFormComponent } from './role-form/role-form.component';

const roleData = { roles: [UserRoleEnum.Admin] };

const routes: Routes = [
  {
    path: 'user-account-list',
    component: UserAccountListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-user-account',
    component: UserAccountFormComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-user-account/:id',
    component: UserAccountFormComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'role-list',
    component: RoleListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-role',
    component: RoleFormComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-role/:id',
    component: RoleFormComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccessControlManagementRoutingModule {}
