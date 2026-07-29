import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import { RecruitmentAnalyticsComponent } from './recruitment-analytics/recruitment-analytics.component';

@NgModule({
  declarations: [RecruitmentAnalyticsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    AnalyticsRoutingModule,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    ChartModule,
  ],
})
export class AnalyticsModule {}
