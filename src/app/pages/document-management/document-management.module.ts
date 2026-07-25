import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { DocumentManagementRoutingModule } from './document-management-routing.module';
import { DocumentTemplateListComponent } from './document-template-list/document-template-list.component';
import { DocumentTemplateFormComponent } from './document-template-form/document-template-form.component';
import { OfferLetterListComponent } from './offer-letter-list/offer-letter-list.component';
import { OfferLetterFormComponent } from './offer-letter-form/offer-letter-form.component';
import { AppointmentLetterListComponent } from './appointment-letter-list/appointment-letter-list.component';
import { AppointmentLetterFormComponent } from './appointment-letter-form/appointment-letter-form.component';
import { DocumentTrackingListComponent } from './document-tracking-list/document-tracking-list.component';

@NgModule({
  declarations: [
    DocumentTemplateListComponent,
    DocumentTemplateFormComponent,
    OfferLetterListComponent,
    OfferLetterFormComponent,
    AppointmentLetterListComponent,
    AppointmentLetterFormComponent,
    DocumentTrackingListComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    DocumentManagementRoutingModule,
    ConfirmDialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FloatLabelModule,
    SkeletonModule,
    TableModule,
    TextareaModule,
  ],
})
export class DocumentManagementModule {}
