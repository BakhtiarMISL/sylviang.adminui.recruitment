import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobVacancyListComponent } from './job-vacancy-list/job-vacancy-list.component';
import { ManageJobVacancyComponent } from './manage-job-vacancy/manage-job-vacancy.component';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'job-vacancy-list',
    component: JobVacancyListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-job-vacancy',
    component: ManageJobVacancyComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-job-vacancy/:id',
    component: ManageJobVacancyComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobVacancyManagementRoutingModule {}
