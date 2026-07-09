import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { SharedModule } from '@shared/shared.module';
import { ApplyFormComponent } from './apply-form/apply-form.component';
import { CareerPortalRoutingModule } from './career-portal-routing.module';
import { JobBrowseComponent } from './job-browse/job-browse.component';
import { JobDetailComponent } from './job-detail/job-detail.component';

@NgModule({
  declarations: [JobBrowseComponent, JobDetailComponent, ApplyFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    CareerPortalRoutingModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    FloatLabelModule,
    SkeletonModule,
    TextareaModule,
    PaginatorModule,
  ],
})
export class CareerPortalModule {}
