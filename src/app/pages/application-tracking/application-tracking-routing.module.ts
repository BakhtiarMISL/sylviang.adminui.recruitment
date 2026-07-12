import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { AtsDashboardComponent } from './ats-dashboard/ats-dashboard.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplyOnBehalfComponent } from './apply-on-behalf/apply-on-behalf.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: '',
    component: AtsDashboardComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'apply-on-behalf',
    component: ApplyOnBehalfComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: ':id',
    component: ApplicationDetailComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationTrackingRoutingModule {}
