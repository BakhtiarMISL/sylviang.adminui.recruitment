import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { ScorecardListComponent } from './scorecard-list/scorecard-list.component';
import { ManageScorecardComponent } from './manage-scorecard/manage-scorecard.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'scorecard-list',
    component: ScorecardListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-scorecard',
    component: ManageScorecardComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-scorecard/:id',
    component: ManageScorecardComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScorecardManagementRoutingModule {}
