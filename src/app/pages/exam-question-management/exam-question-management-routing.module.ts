import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { QuestionGroupListComponent } from './question-group-list/question-group-list.component';
import { ManageQuestionGroupComponent } from './manage-question-group/manage-question-group.component';
import { ExamQuestionListComponent } from './exam-question-list/exam-question-list.component';
import { ManageExamQuestionComponent } from './manage-exam-question/manage-exam-question.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  {
    path: 'question-group-list',
    component: QuestionGroupListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-question-group',
    component: ManageQuestionGroupComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-question-group/:id',
    component: ManageQuestionGroupComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'exam-question-list',
    component: ExamQuestionListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-exam-question',
    component: ManageExamQuestionComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-exam-question/:id',
    component: ManageExamQuestionComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExamQuestionManagementRoutingModule {}
