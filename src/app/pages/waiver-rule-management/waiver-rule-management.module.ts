import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { WaiverRuleManagementRoutingModule } from './waiver-rule-management-routing.module';
import { WaiverRuleListComponent } from './waiver-rule-list/waiver-rule-list.component';
import { WaiverRuleFormComponent } from './waiver-rule-form/waiver-rule-form.component';

@NgModule({
  declarations: [WaiverRuleListComponent, WaiverRuleFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    WaiverRuleManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputNumberModule,
    TextareaModule,
  ],
})
export class WaiverRuleManagementModule {}
