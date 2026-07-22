import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobBrowseComponent } from './job-browse/job-browse.component';
import { JobDetailComponent } from './job-detail/job-detail.component';
import { PaymentResultComponent } from './payment-result/payment-result.component';

const routes: Routes = [
  {
    path: '',
    component: JobBrowseComponent,
  },
  {
    path: 'jobs/:id',
    component: JobDetailComponent,
  },
  {
    path: 'payment-result',
    component: PaymentResultComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CareerPortalRoutingModule {}
