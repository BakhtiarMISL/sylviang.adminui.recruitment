import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountSettingsComponent } from './account-settings/account-settings.component';

// Intentionally no RoleGuard / canActivate / data:{roles} here, matching
// internal-job-board-routing.module.ts - reachable by any authenticated role (Admin/HR/Candidate
// all share this page for email/password/photo settings).
const routes: Routes = [
  {
    path: '',
    component: AccountSettingsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountSettingsManagementRoutingModule {}
