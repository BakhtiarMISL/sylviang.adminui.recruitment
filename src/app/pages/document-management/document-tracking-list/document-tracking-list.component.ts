import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UI_CONFIG } from '@app/@core/constants';
import { BreadcrumbService } from '@app/@core/services';
import { DocumentAcceptanceStatusEnum, DocumentTypeEnum } from '@app/@core/enums/recruitment.enum';
import { DocumentTrackingService } from '@app/@core/services/recruitment/document-tracking/document-tracking.service';
import { IDocumentTrackingFilterRequest, IDocumentTrackingItemResponse } from '@core/interfaces/recruitment-management/document-tracking.interface';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-document-tracking-list',
  standalone: false,
  templateUrl: './document-tracking-list.component.html',
  styleUrl: './document-tracking-list.component.scss',
})
export class DocumentTrackingListComponent implements OnInit {
  constructor(
    private documentTrackingService: DocumentTrackingService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: IDocumentTrackingItemResponse[] = [];
  loading = false;
  errorMessage = '';
  totalRecords = 0;
  UI_CONFIG = UI_CONFIG;
  rows: number = UI_CONFIG.defaultPageSize;
  currentPage = 1;

  filterDocumentType: DocumentTypeEnum | null = null;
  filterAcceptanceStatus: DocumentAcceptanceStatusEnum | null = null;

  documentTypeOptions = Object.values(DocumentTypeEnum)
    .filter((value) =>
      [
        DocumentTypeEnum.OfferLetter,
        DocumentTypeEnum.AppointmentLetter,
        DocumentTypeEnum.JoiningBooklet,
        DocumentTypeEnum.MedicalReferral,
        DocumentTypeEnum.TargetLetter,
      ].includes(value),
    )
    .map((value) => ({ label: value, value }));
  acceptanceStatusOptions = Object.values(DocumentAcceptanceStatusEnum).map((value) => ({ label: value, value }));

  get skeletonItems() {
    return Array(6)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/document-management/offer-letter-list' },
      { title: 'Document Tracking', icon: 'fa-solid fa-list-check', href: '/document-management/document-tracking-list' },
    ]);
    this.loadItems();
  }

  private buildFilter(): IDocumentTrackingFilterRequest {
    return {
      documentType: this.filterDocumentType ?? undefined,
      acceptanceStatus: this.filterAcceptanceStatus ?? undefined,
      page: this.currentPage,
      pageSize: this.rows,
    };
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.documentTrackingService.getAll(this.buildFilter()).subscribe({
      next: (response) => {
        this.items = !response.hasError && response.content ? response.content.data : [];
        this.totalRecords = !response.hasError && response.content ? response.content.totalCount : 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.items = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadItems();
  }

  resetFilters(): void {
    this.filterDocumentType = null;
    this.filterAcceptanceStatus = null;
    this.currentPage = 1;
    this.loadItems();
  }

  onPageChange(event: { page?: number; rows?: number }): void {
    this.currentPage = (event.page ?? 0) + 1;
    this.rows = event.rows ?? this.rows;
    this.loadItems();
  }

  isPending(item: IDocumentTrackingItemResponse): boolean {
    return item.acceptanceStatus === DocumentAcceptanceStatusEnum.Pending;
  }

  isDeclined(item: IDocumentTrackingItemResponse): boolean {
    return item.acceptanceStatus === DocumentAcceptanceStatusEnum.Declined;
  }

  followUp(item: IDocumentTrackingItemResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Send a follow-up reminder to ${item.recipientName}?`,
      header: 'Follow-up Confirmation',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-paper-plane',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.documentTrackingService.followUp(item.documentType, item.sourceId).subscribe({
          next: () => this.loadItems(),
          error: (error) => {
            this.errorMessage = error?.error?.decentMessage || 'Failed to send follow-up reminder.';
            this.cdr.detectChanges();
          },
        });
      },
    });
  }
}
