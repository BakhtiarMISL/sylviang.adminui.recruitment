import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { MyApplicationsRoutingModule } from './my-applications-routing.module';
import { MyApplicationsComponent } from './my-applications.component';

@NgModule({
  declarations: [MyApplicationsComponent],
  imports: [CommonModule, RouterModule, SharedModule, TranslateModule, MyApplicationsRoutingModule, ButtonModule, ConfirmDialogModule, SkeletonModule],
})
export class MyApplicationsModule {}
