import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UI_CONFIG } from '@app/@core/constants';
import { NotificationChannelEnum, NotificationStatusEnum, RecruitmentEventEnum } from '@app/@core/enums/recruitment.enum';
import { INotificationLogFilterRequest, INotificationLogResponse } from '@app/@core/interfaces/recruitment-management/notification-log.interface';
import { NotificationLogService } from '@app/@core/services/recruitment/notification-log/notification-log.service';
import { saveFileResponse } from '@app/@core/services/recruitment/cv-bank/cv-bank.service';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-notification-log-list',
  standalone: false,
  templateUrl: './notification-log-list.component.html',
  styleUrl: './notification-log-list.component.scss',
})
export class NotificationLogListComponent implements OnInit {
  constructor(
    private notificationLogService: NotificationLogService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: INotificationLogResponse[] = [];
  loading = false;
  errorMessage = '';
  totalRecords = 0;
  UI_CONFIG = UI_CONFIG;
  rows: number = UI_CONFIG.defaultPageSize;
  currentPage = 1;

  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;
  filterChannel: NotificationChannelEnum | null = null;
  filterEvent: RecruitmentEventEnum | null = null;
  filterStatus: NotificationStatusEnum | null = null;

  channelOptions = Object.values(NotificationChannelEnum).map((value) => ({ label: value, value }));
  eventOptions = Object.values(RecruitmentEventEnum).map((value) => ({ label: value, value }));
  statusOptions = Object.values(NotificationStatusEnum).map((value) => ({ label: value, value }));

  get skeletonItems() {
    return Array(6)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/notification-management/notification-log-list' },
      { title: 'Notification Log', icon: 'fa-solid fa-clock-rotate-left', href: '/notification-management/notification-log-list' },
    ]);
    this.loadItems();
  }

  private buildFilter(): INotificationLogFilterRequest {
    return {
      fromDate: this.filterDateFrom ? this.filterDateFrom.toISOString() : undefined,
      toDate: this.filterDateTo ? this.filterDateTo.toISOString() : undefined,
      channel: this.filterChannel ?? undefined,
      recruitmentEvent: this.filterEvent ?? undefined,
      deliveryStatus: this.filterStatus ?? undefined,
      page: this.currentPage,
      pageSize: this.rows,
    };
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.notificationLogService.getAll(this.buildFilter()).subscribe({
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
    this.filterDateFrom = null;
    this.filterDateTo = null;
    this.filterChannel = null;
    this.filterEvent = null;
    this.filterStatus = null;
    this.currentPage = 1;
    this.loadItems();
  }

  onPageChange(event: { page?: number; rows?: number }): void {
    this.currentPage = (event.page ?? 0) + 1;
    this.rows = event.rows ?? this.rows;
    this.loadItems();
  }

  isFailed(item: INotificationLogResponse): boolean {
    return item.deliveryStatus === NotificationStatusEnum.Failed;
  }

  retry(item: INotificationLogResponse): void {
    this.notificationLogService.retry(item.notificationLogId).subscribe({
      next: () => this.loadItems(),
      error: (error) => {
        this.errorMessage = error?.error?.decentMessage || 'Failed to retry notification.';
        this.cdr.detectChanges();
      },
    });
  }

  exportExcel(): void {
    this.notificationLogService.exportExcel(this.buildFilter()).subscribe({
      next: (response) => saveFileResponse(response, 'Notification-Log.xlsx'),
    });
  }
}
