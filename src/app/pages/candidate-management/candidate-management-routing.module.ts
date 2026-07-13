import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { CandidateListComponent } from './candidate-list/candidate-list.component';
import { CandidateDetailComponent } from './candidate-detail/candidate-detail.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: '',
    component: CandidateListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: ':id',
    component: CandidateDetailComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CandidateManagementRoutingModule {}
