import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { AssessmentWorkflowListComponent } from './assessment-workflow-list/assessment-workflow-list.component';
import { ManageAssessmentWorkflowComponent } from './manage-assessment-workflow/manage-assessment-workflow.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'assessment-workflow-list',
    component: AssessmentWorkflowListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-assessment-workflow',
    component: ManageAssessmentWorkflowComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-assessment-workflow/:id',
    component: ManageAssessmentWorkflowComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssessmentWorkflowManagementRoutingModule {}
