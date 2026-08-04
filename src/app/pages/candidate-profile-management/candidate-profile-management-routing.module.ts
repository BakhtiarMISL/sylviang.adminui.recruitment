import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { MyOfferLettersComponent } from './my-offer-letters/my-offer-letters.component';
import { MyOfferLetterDetailComponent } from './my-offer-letter-detail/my-offer-letter-detail.component';
import { MyAppointmentLettersComponent } from './my-appointment-letters/my-appointment-letters.component';
import { MyAppointmentLetterDetailComponent } from './my-appointment-letter-detail/my-appointment-letter-detail.component';
import { PreBoardingFormComponent } from './pre-boarding-form/pre-boarding-form.component';

// Intentionally no RoleGuard / canActivate / data:{roles} here, matching
// internal-job-board-routing.module.ts - reachable by any authenticated role. An
// Admin/HR hitting this directly just auto-provisions their own unused profile row.
const routes: Routes = [
  {
    path: '',
    component: MyProfileComponent,
  },
  {
    path: 'offer-letters',
    component: MyOfferLettersComponent,
  },
  {
    path: 'offer-letters/:id',
    component: MyOfferLetterDetailComponent,
  },
  {
    path: 'appointment-letters',
    component: MyAppointmentLettersComponent,
  },
  {
    path: 'appointment-letters/:id',
    component: MyAppointmentLetterDetailComponent,
  },
  {
    path: 'pre-boarding',
    component: PreBoardingFormComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CandidateProfileManagementRoutingModule {}
