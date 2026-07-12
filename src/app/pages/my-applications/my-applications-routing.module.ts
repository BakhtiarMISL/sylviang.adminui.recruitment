import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyApplicationsComponent } from './my-applications.component';

// Intentionally no RoleGuard / canActivate / data:{roles} here, matching
// candidate-profile-management-routing.module.ts - reachable by any authenticated role.
const routes: Routes = [
  {
    path: '',
    component: MyApplicationsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyApplicationsRoutingModule {}
