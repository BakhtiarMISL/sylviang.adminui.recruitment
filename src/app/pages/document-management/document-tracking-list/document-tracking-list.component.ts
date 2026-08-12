import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UI_CONFIG } from '@app/@core/constants';
import { BreadcrumbService } from '@app/@core/services';
import { DocumentAcceptanceStatusEnum, DocumentTypeEnum } from '@app/@core/enums/recruitment.enum';
import { DocumentTrackingService } from '@app/@core/services/recruitment/document-tracking/document-tracking.service';
import { IDocumentTrackingFilterRequest, IDocumentTrackingItemResponse } from '@core/interfaces/recruitment-management/document-tracking.interface';
import { Base_URL } from '@env/environment';
import { ConfirmationService } from 'primeng/api';

// Every DocumentTypeEnum value that DocumentTrackingService actually aggregates (has a real
// generated-document entity behind it). RejectionLetter/ExperienceCertificate/RelievingLetter
// are template-only enum values with no generation feature built yet - listing them here would
// just filter to an always-empty result.
const TRACKED_DOCUMENT_TYPES = [
  DocumentTypeEnum.OfferLetter,
  DocumentTypeEnum.AppointmentLetter,
  DocumentTypeEnum.JoiningBooklet,
  DocumentTypeEnum.MedicalReferral,
  DocumentTypeEnum.TargetLetter,
  DocumentTypeEnum.OfficeNote,
];

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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  items: IDocumentTrackingItemResponse[] = [];
  loading = false;
  errorMessage = '';
  totalRecords = 0;
  UI_CONFIG = UI_CONFIG;
  rows: number = UI_CONFIG.defaultPageSize;
  currentPage = 1;
  filtersCollapsed = true;

  // Set only when arriving from an application's Documents tab (?jobApplicationId=) - scopes the
  // list to that one application's generated documents instead of every document in the system.
  jobApplicationId: number | null = null;

  filterDocumentType: DocumentTypeEnum | null = null;
  filterAcceptanceStatus: DocumentAcceptanceStatusEnum | null = null;

  documentTypeOptions = Object.values(DocumentTypeEnum)
    .filter((value) => TRACKED_DOCUMENT_TYPES.includes(value))
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

    this.route.queryParamMap.subscribe((params) => {
      const idParam = params.get('jobApplicationId');
      this.jobApplicationId = idParam ? +idParam : null;
      this.currentPage = 1;
      this.loadItems();
    });
  }

  private buildFilter(): IDocumentTrackingFilterRequest {
    return {
      documentType: this.filterDocumentType ?? undefined,
      acceptanceStatus: this.filterAcceptanceStatus ?? undefined,
      jobApplicationId: this.jobApplicationId ?? undefined,
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
    this.filtersCollapsed = true;
    this.loadItems();
  }

  resetFilters(): void {
    this.filterDocumentType = null;
    this.filterAcceptanceStatus = null;
    this.currentPage = 1;
    this.filtersCollapsed = false;
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

  getPdfUrl(item: IDocumentTrackingItemResponse): string {
    if (!item.generatedPdfPath) return '';
    return `${Base_URL}${item.generatedPdfPath.startsWith('/') ? '' : '/'}${item.generatedPdfPath}`;
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
