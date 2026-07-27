import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { FinalSelectionPoolManagementRoutingModule } from './final-selection-pool-management-routing.module';
import { FinalSelectionPoolListComponent } from './final-selection-pool-list/final-selection-pool-list.component';
import { PreBoardingReviewComponent } from './pre-boarding-review/pre-boarding-review.component';

@NgModule({
  declarations: [FinalSelectionPoolListComponent, PreBoardingReviewComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    FinalSelectionPoolManagementRoutingModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    DatePickerModule,
    SkeletonModule,
    TableModule,
    DialogModule,
    TextareaModule,
  ],
})
export class FinalSelectionPoolManagementModule {}
