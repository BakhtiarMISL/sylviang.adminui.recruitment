import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { NotificationManagementRoutingModule } from './notification-management-routing.module';
import { NotificationTemplateListComponent } from './notification-template-list/notification-template-list.component';
import { NotificationTemplateFormComponent } from './notification-template-form/notification-template-form.component';
import { EventTemplateMappingListComponent } from './event-template-mapping-list/event-template-mapping-list.component';
import { EventTemplateMappingFormComponent } from './event-template-mapping-form/event-template-mapping-form.component';
import { NotificationLogListComponent } from './notification-log-list/notification-log-list.component';

@NgModule({
  declarations: [
    NotificationTemplateListComponent,
    NotificationTemplateFormComponent,
    EventTemplateMappingListComponent,
    EventTemplateMappingFormComponent,
    NotificationLogListComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    NotificationManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    SkeletonModule,
    TableModule,
    TextareaModule,
  ],
})
export class NotificationManagementModule {}
