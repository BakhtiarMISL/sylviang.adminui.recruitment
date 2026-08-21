import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { PaymentTransactionListComponent } from './payment-transaction-list/payment-transaction-list.component';
import { ReconciliationReportComponent } from './reconciliation-report/reconciliation-report.component';

const roleData = { roles: [UserRoleEnum.Admin, UserRoleEnum.HR] };

const routes: Routes = [
  { path: 'payment-transaction-list', component: PaymentTransactionListComponent, canActivate: [RoleGuard], data: roleData },
  { path: 'reconciliation-report', component: ReconciliationReportComponent, canActivate: [RoleGuard], data: roleData },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentManagementRoutingModule {}
