import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { TalentPoolListComponent } from './talent-pool-list/talent-pool-list.component';
import { TalentPoolDetailComponent } from './talent-pool-detail/talent-pool-detail.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'talent-pool-list',
    component: TalentPoolListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'talent-pool-detail/:id',
    component: TalentPoolDetailComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TalentPoolManagementRoutingModule {}
