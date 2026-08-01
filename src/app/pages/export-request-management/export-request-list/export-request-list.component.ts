import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UI_CONFIG } from '@app/@core/constants';
import { ExportRequestStatusEnum } from '@app/@core/enums/recruitment.enum';
import { IExportRequestFilterRequest, IExportRequestResponse } from '@app/@core/interfaces/recruitment-management/export-request.interface';
import { ExportRequestService } from '@app/@core/services/recruitment/export-request/export-request.service';
import { saveFileResponse } from '@app/@core/services/recruitment/cv-bank/cv-bank.service';
import { BreadcrumbService } from '@app/@core/services';

/** How often the list re-polls while any row is still Pending/Processing (EP-13 US-104) - same
 * interval-polling idiom the header notification bell already uses. */
const POLL_INTERVAL_MS = 15000;

@Component({
  selector: 'app-export-request-list',
  standalone: false,
  templateUrl: './export-request-list.component.html',
  styleUrl: './export-request-list.component.scss',
})
export class ExportRequestListComponent implements OnInit, OnDestroy {
  constructor(
    private exportRequestService: ExportRequestService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: IExportRequestResponse[] = [];
  loading = false;
  errorMessage = '';
  totalRecords = 0;
  UI_CONFIG = UI_CONFIG;
  rows: number = UI_CONFIG.defaultPageSize;
  currentPage = 1;
  downloadingId: number | null = null;

  filterStatus: ExportRequestStatusEnum | null = null;
  statusOptions = Object.values(ExportRequestStatusEnum).map((value) => ({ label: value, value }));

  private pollTimer: ReturnType<typeof setInterval> | null = null;

  get skeletonItems() {
    return Array(6)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/export-requests/export-request-list' },
      { title: 'Export Requests', icon: 'fa-solid fa-file-export', href: '/export-requests/export-request-list' },
    ]);
    this.loadItems();
    this.pollTimer = setInterval(() => this.pollIfInFlight(), POLL_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  private pollIfInFlight(): void {
    const hasInFlight = this.items.some(
      (i) => i.status === ExportRequestStatusEnum.Pending || i.status === ExportRequestStatusEnum.Processing,
    );
    if (hasInFlight) this.loadItems();
  }

  private buildFilter(): IExportRequestFilterRequest {
    return {
      status: this.filterStatus ?? undefined,
      page: this.currentPage,
      pageSize: this.rows,
    };
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.exportRequestService.getAll(this.buildFilter()).subscribe({
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
    this.filterStatus = null;
    this.currentPage = 1;
    this.loadItems();
  }

  onPageChange(event: { page?: number; rows?: number }): void {
    this.currentPage = (event.page ?? 0) + 1;
    this.rows = event.rows ?? this.rows;
    this.loadItems();
  }

  isCompleted(item: IExportRequestResponse): boolean {
    return item.status === ExportRequestStatusEnum.Completed;
  }

  isFailed(item: IExportRequestResponse): boolean {
    return item.status === ExportRequestStatusEnum.Failed;
  }

  download(item: IExportRequestResponse): void {
    this.downloadingId = item.exportRequestId;
    this.exportRequestService.download(item.exportRequestId).subscribe({
      next: (response) => {
        saveFileResponse(response, item.fileName || `Candidate-List-Export-${item.exportRequestId}.xlsx`);
        this.downloadingId = null;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.decentMessage || 'Failed to download export.';
        this.downloadingId = null;
        this.cdr.detectChanges();
      },
    });
  }
}
