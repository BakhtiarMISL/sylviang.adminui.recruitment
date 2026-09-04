import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { UserAccountListComponent } from './user-account-list/user-account-list.component';
import { UserAccountFormComponent } from './user-account-form/user-account-form.component';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleFormComponent } from './role-form/role-form.component';

// SuperAdmin needs the user-account routes too - it's where they invite/manage HR/Admin accounts
// and impersonate one (see nav-menu-items.ts's "Access Control" entry). Role management stays
// Admin-only - designing role/permission structures isn't part of SuperAdmin's job.
const userAccountRoleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.SuperAdmin] };
const roleData = { roles: [UserRoleEnum.Admin] };

const routes: Routes = [
  {
    path: 'user-account-list',
    component: UserAccountListComponent,
    canActivate: [RoleGuard],
    data: userAccountRoleData,
  },
  {
    path: 'manage-user-account',
    component: UserAccountFormComponent,
    canActivate: [RoleGuard],
    data: userAccountRoleData,
  },
  {
    path: 'manage-user-account/:id',
    component: UserAccountFormComponent,
    canActivate: [RoleGuard],
    data: userAccountRoleData,
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
