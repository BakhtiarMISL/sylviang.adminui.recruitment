import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { PublicLandingRoutingModule } from './public-landing-routing.module';

@NgModule({
  declarations: [LandingPageComponent],
  imports: [CommonModule, RouterModule, SharedModule, PublicLandingRoutingModule],
})
export class PublicLandingModule {}
