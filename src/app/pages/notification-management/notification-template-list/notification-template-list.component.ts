import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { NotificationTemplateService } from '@app/@core/services/recruitment/notification-template/notification-template.service';
import { INotificationTemplateResponse } from '@core/interfaces/recruitment-management/notification-template.interface';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-notification-template-list',
  standalone: false,
  templateUrl: './notification-template-list.component.html',
  styleUrl: './notification-template-list.component.scss',
})
export class NotificationTemplateListComponent implements OnInit {
  constructor(
    private notificationTemplateService: NotificationTemplateService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
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
    this.loadItems();
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
