import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { CvBankSearchComponent } from './cv-bank-search/cv-bank-search.component';
import { TalentPoolListComponent } from './talent-pool-list/talent-pool-list.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: '',
    component: CvBankSearchComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'talent-pool',
    component: TalentPoolListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CvBankManagementRoutingModule {}
