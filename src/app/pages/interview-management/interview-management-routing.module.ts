import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { InterviewListComponent } from './interview-list/interview-list.component';
import { ScheduleInterviewComponent } from './schedule-interview/schedule-interview.component';
import { InterviewDetailComponent } from './interview-detail/interview-detail.component';
import { EvaluateInterviewComponent } from './evaluate-interview/evaluate-interview.component';
import { InterviewResultsComponent } from './interview-results/interview-results.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'interview-list',
    component: InterviewListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'schedule-interview',
    component: ScheduleInterviewComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'interview/:id',
    component: InterviewDetailComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'interview/:id/evaluate',
    component: EvaluateInterviewComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'interview/:id/results',
    component: InterviewResultsComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterviewManagementRoutingModule {}
