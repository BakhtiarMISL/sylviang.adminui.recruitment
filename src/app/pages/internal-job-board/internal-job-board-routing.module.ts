import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InternalJobListComponent } from './internal-job-list/internal-job-list.component';
import { InternalJobDetailComponent } from './internal-job-detail/internal-job-detail.component';
import { InternalPaymentResultComponent } from './internal-payment-result/internal-payment-result.component';

// Intentionally no RoleGuard / canActivate / data:{roles} here — the internal job board
// must be reachable by ANY authenticated role. The parent '' route's AuthGuard (see
// app.routes.ts) already ensures login is required; nothing extra needed here.
const routes: Routes = [
  {
    path: 'job-list',
    component: InternalJobListComponent,
  },
  {
    path: 'jobs/:id',
    component: InternalJobDetailComponent,
  },
  {
    path: 'payment-result',
    component: InternalPaymentResultComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternalJobBoardRoutingModule {}
