import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { InternalApplyFormComponent } from './internal-apply-form/internal-apply-form.component';
import { InternalJobBoardRoutingModule } from './internal-job-board-routing.module';
import { InternalJobDetailComponent } from './internal-job-detail/internal-job-detail.component';
import { InternalJobListComponent } from './internal-job-list/internal-job-list.component';
import { InternalPaymentResultComponent } from './internal-payment-result/internal-payment-result.component';

@NgModule({
  declarations: [InternalJobListComponent, InternalJobDetailComponent, InternalApplyFormComponent, InternalPaymentResultComponent],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    SharedModule,
    InternalJobBoardRoutingModule,
    RouterModule,
    TranslateModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    FloatLabelModule,
    SelectModule,
    SkeletonModule,
    InputNumberModule,
    TextareaModule,
  ],
})
export class InternalJobBoardModule {}
