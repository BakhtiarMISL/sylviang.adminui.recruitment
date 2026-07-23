import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { CandidateRecommendationListComponent } from './candidate-recommendation-list/candidate-recommendation-list.component';

const roleData = { roles: [UserRoleEnum.Admin] };

const routes: Routes = [
  {
    path: 'candidate-recommendation-list',
    component: CandidateRecommendationListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CandidateRecommendationManagementRoutingModule {}
