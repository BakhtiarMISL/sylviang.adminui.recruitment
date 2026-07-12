import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Shell } from '@app/shell/services/shell.service';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'attendance',
      loadChildren: () => import('./attendance-management/attendance-management.module').then((m) => m.AttendanceManagementModule),
    },
    {
      path: 'payroll',
      loadChildren: () => import('./payroll-management/payroll-management.module').then((m) => m.PayrollManagementModule),
    },
    {
      path: 'job-vacancy',
      loadChildren: () => import('./job-vacancy-management/job-vacancy-management.module').then((m) => m.JobVacancyManagementModule),
    },
    {
      path: 'candidates',
      loadChildren: () => import('./candidate-management/candidate-management.module').then((m) => m.CandidateManagementModule),
    },
    {
      path: 'internal-jobs',
      loadChildren: () => import('./internal-job-board/internal-job-board.module').then((m) => m.InternalJobBoardModule),
    },
    {
      path: 'hiring-pipeline',
      loadChildren: () => import('./hiring-pipeline-management/hiring-pipeline-management.module').then((m) => m.HiringPipelineManagementModule),
    },
    {
      path: 'applications',
      loadChildren: () => import('./application-tracking/application-tracking.module').then((m) => m.ApplicationTrackingModule),
    },
    {
      path: 'candidate-profile',
      loadChildren: () => import('./candidate-profile-management/candidate-profile-management.module').then((m) => m.CandidateProfileManagementModule),
    },
    {
      path: 'account-settings',
      loadChildren: () => import('./account-settings-management/account-settings-management.module').then((m) => m.AccountSettingsManagementModule),
    },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
