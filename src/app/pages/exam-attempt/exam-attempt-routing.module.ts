import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExamAttemptComponent } from './exam-attempt.component';

// Intentionally no RoleGuard / canActivate / data:{roles} here, matching
// my-applications-routing.module.ts - reachable by any authenticated role. The backend's
// [Authorize(Roles="Candidate")] plus its own JobApplication.CandidateProfileId ownership
// check on ExamTakingController is what actually restricts this to the owning candidate.
const routes: Routes = [
  {
    path: ':enrollmentId',
    component: ExamAttemptComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExamAttemptRoutingModule {}
