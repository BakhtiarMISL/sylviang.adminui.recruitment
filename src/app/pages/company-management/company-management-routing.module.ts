import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { CompanyListComponent } from './company-list/company-list.component';
import { CompanyFormComponent } from './company-form/company-form.component';

// SuperAdmin-only across the board - a Company Admin/HR manages their own company's recruitment
// data, never the company record itself or any other tenant's (see UserAccountService's own
// company-scoping on the backend, which enforces this the same way regardless of what this
// guard shows/hides).
const companyRoleData = { roles: [UserRoleEnum.SuperAdmin] };

const routes: Routes = [
  {
    path: 'company-list',
    component: CompanyListComponent,
    canActivate: [RoleGuard],
    data: companyRoleData,
  },
  {
    path: 'manage-company',
    component: CompanyFormComponent,
    canActivate: [RoleGuard],
    data: companyRoleData,
  },
  {
    path: 'manage-company/:id',
    component: CompanyFormComponent,
    canActivate: [RoleGuard],
    data: companyRoleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyManagementRoutingModule {}
