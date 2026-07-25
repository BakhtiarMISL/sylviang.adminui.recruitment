import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { DocumentTemplateListComponent } from './document-template-list/document-template-list.component';
import { DocumentTemplateFormComponent } from './document-template-form/document-template-form.component';
import { OfferLetterListComponent } from './offer-letter-list/offer-letter-list.component';
import { OfferLetterFormComponent } from './offer-letter-form/offer-letter-form.component';

const roleData = { roles: [UserRoleEnum.Admin] };

const routes: Routes = [
  {
    path: 'document-template-list',
    component: DocumentTemplateListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-document-template',
    component: DocumentTemplateFormComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-document-template/:id',
    component: DocumentTemplateFormComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'offer-letter-list',
    component: OfferLetterListComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
  {
    path: 'manage-offer-letter',
    component: OfferLetterFormComponent,
    canActivate: [RoleGuard],
    data: roleData,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentManagementRoutingModule {}
