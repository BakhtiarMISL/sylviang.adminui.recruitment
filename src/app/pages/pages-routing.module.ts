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
      path: 'cv-bank',
      loadChildren: () => import('./cv-bank-management/cv-bank-management.module').then((m) => m.CvBankManagementModule),
    },
    {
      path: 'talent-pools',
      loadChildren: () => import('./talent-pool-management/talent-pool-management.module').then((m) => m.TalentPoolManagementModule),
    },
    {
      path: 'internal-jobs',
      loadChildren: () => import('./internal-job-board/internal-job-board.module').then((m) => m.InternalJobBoardModule),
    },
    {
      // Same public CareerPortalModule as the anonymous '/careers' route in app.routes.ts, wrapped
      // in Shell here for logged-in users - that top-level route canMatch's away once authenticated
      // (see isAnonymous guard) so this is the one that actually resolves post-login.
      path: 'careers',
      loadChildren: () => import('../career-portal/career-portal.module').then((m) => m.CareerPortalModule),
    },
    {
      path: 'hiring-pipeline',
      loadChildren: () => import('./hiring-pipeline-management/hiring-pipeline-management.module').then((m) => m.HiringPipelineManagementModule),
    },
    {
      path: 'shortlist-filters',
      loadChildren: () => import('./shortlist-filter-management/shortlist-filter-management.module').then((m) => m.ShortlistFilterManagementModule),
    },
    {
      path: 'candidate-recommendations',
      loadChildren: () => import('./candidate-recommendation-management/candidate-recommendation-management.module').then((m) => m.CandidateRecommendationManagementModule),
    },
    {
      path: 'exam-questions',
      loadChildren: () => import('./exam-question-management/exam-question-management.module').then((m) => m.ExamQuestionManagementModule),
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
      path: 'my-applications',
      loadChildren: () => import('./my-applications/my-applications.module').then((m) => m.MyApplicationsModule),
    },
    {
      path: 'account-settings',
      loadChildren: () => import('./account-settings-management/account-settings-management.module').then((m) => m.AccountSettingsManagementModule),
    },
    {
      path: 'exam-venues',
      loadChildren: () => import('./exam-venue-management/exam-venue-management.module').then((m) => m.ExamVenueManagementModule),
    },
    {
      path: 'application-settings',
      loadChildren: () => import('./application-settings-management/application-settings-management.module').then((m) => m.ApplicationSettingsManagementModule),
    },
    {
      path: 'master-data',
      loadChildren: () => import('./master-data-management/master-data-management.module').then((m) => m.MasterDataManagementModule),
    },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
