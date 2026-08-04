import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { SharedModule } from '@shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { OtpVerifyComponent } from './otp-verify/otp-verify.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

@NgModule({
  declarations: [LoginComponent, OtpVerifyComponent, ForgotPasswordComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SharedModule, AuthRoutingModule, ButtonModule, InputTextModule, FloatLabelModule, InputOtpModule],
})
export class AuthModule {}
