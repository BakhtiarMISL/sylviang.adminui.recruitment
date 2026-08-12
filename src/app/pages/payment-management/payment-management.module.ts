import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { PaymentManagementRoutingModule } from './payment-management-routing.module';
import { PaymentTransactionListComponent } from './payment-transaction-list/payment-transaction-list.component';
import { ReconciliationReportComponent } from './reconciliation-report/reconciliation-report.component';

@NgModule({
  declarations: [PaymentTransactionListComponent, ReconciliationReportComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    PaymentManagementRoutingModule,
    ButtonModule,
    DatePickerModule,
  ],
})
export class PaymentManagementModule {}
