import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyProfileComponent } from './my-profile/my-profile.component';

// Intentionally no RoleGuard / canActivate / data:{roles} here, matching
// internal-job-board-routing.module.ts - reachable by any authenticated role. An
// Admin/HR hitting this directly just auto-provisions their own unused profile row.
const routes: Routes = [
  {
    path: '',
    component: MyProfileComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CandidateProfileManagementRoutingModule {}
