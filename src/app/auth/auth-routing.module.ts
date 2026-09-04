import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { OtpVerifyComponent } from './otp-verify/otp-verify.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AcceptInviteComponent } from './accept-invite/accept-invite.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'verify-otp',
    component: OtpVerifyComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'accept-invite',
    component: AcceptInviteComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
