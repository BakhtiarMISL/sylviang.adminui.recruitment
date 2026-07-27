import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ProductSectionComponent } from '../misl-landing/product-section/product-section.component';
import { ProductsOverviewComponent } from '../misl-landing/products-overview/products-overview.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { PublicLandingRoutingModule } from './public-landing-routing.module';

@NgModule({
  declarations: [LandingPageComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    PublicLandingRoutingModule,
    ProductsOverviewComponent,
    ProductSectionComponent,
  ],
})
export class PublicLandingModule {}
