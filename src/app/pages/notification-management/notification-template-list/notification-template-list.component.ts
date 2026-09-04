import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { NotificationTemplateService } from '@app/@core/services/recruitment/notification-template/notification-template.service';
import { TableStateService } from '@app/@core/services/table-state.service';
import { INotificationTemplateResponse } from '@core/interfaces/recruitment-management/notification-template.interface';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-notification-template-list',
  standalone: false,
  templateUrl: './notification-template-list.component.html',
  styleUrl: './notification-template-list.component.scss',
})
export class NotificationTemplateListComponent implements OnInit, AfterViewInit {
  private readonly STATE_KEY = 'notification-template-list';
  @ViewChild('dt') dt!: Table;
  first = 0;
  rows = 10;

  constructor(
    private notificationTemplateService: NotificationTemplateService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
    private tableState: TableStateService,
  ) {}

  items: INotificationTemplateResponse[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';

  get skeletonItems() {
    return Array(4)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/notification-management/notification-template-list' },
      { title: 'Notification Templates', icon: 'fa-solid fa-envelope-open-text', href: '/notification-management/notification-template-list' },
    ]);
    this.restoreState();
    this.loadItems();
  }

  ngAfterViewInit(): void {
    // re-apply global filter after view init if we restored a search term
    if (this.searchTerm && this.dt) {
      setTimeout(() => this.dt.filterGlobal(this.searchTerm, 'contains'), 0);
    }
  }

  private restoreState(): void {
    const s = this.tableState.load<{ first: number; rows: number; searchTerm: string }>(this.STATE_KEY);
    if (s) {
      this.first = s.first ?? 0;
      this.rows = s.rows ?? 10;
      this.searchTerm = s.searchTerm ?? '';
    }
  }

  private saveState(): void {
    this.tableState.save(this.STATE_KEY, { first: this.first, rows: this.rows, searchTerm: this.searchTerm });
  }

  onPage(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.saveState();
  }

  onSearch(): void {
    // reset to first page when searching, like exam-question-list does
    this.first = 0;
    this.saveState();
    if (this.dt) this.dt.filterGlobal(this.searchTerm, 'contains');
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.notificationTemplateService.getAll().subscribe({
      next: (response) => {
        this.items = !response.hasError && response.content ? response.content : [];
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

  deleteItem(item: INotificationTemplateResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Delete template "${item.name}"? This cannot be undone.`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-trash',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.notificationTemplateService.delete(item.notificationTemplateId).subscribe({
          next: () => this.loadItems(),
          error: (error) => {
            this.errorMessage = error?.error?.decentMessage || 'Failed to delete template. It may still be mapped to an event.';
            this.cdr.detectChanges();
          },
        });
      },
    });
  }
}
