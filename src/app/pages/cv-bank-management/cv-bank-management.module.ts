import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { CvBankManagementRoutingModule } from './cv-bank-management-routing.module';
import { CvBankSearchComponent } from './cv-bank-search/cv-bank-search.component';
import { TalentPoolListComponent } from './talent-pool-list/talent-pool-list.component';

@NgModule({
  declarations: [CvBankSearchComponent, TalentPoolListComponent],
  imports: [ReactiveFormsModule, FormsModule, CommonModule, SharedModule, CvBankManagementRoutingModule, RouterModule, TranslateModule, InputNumberModule],
})
export class CvBankManagementModule {}
