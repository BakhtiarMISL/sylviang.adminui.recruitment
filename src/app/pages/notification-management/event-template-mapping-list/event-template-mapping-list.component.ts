import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { EventTemplateMappingService } from '@app/@core/services/recruitment/event-template-mapping/event-template-mapping.service';
import { IEventTemplateMappingResponse } from '@core/interfaces/recruitment-management/event-template-mapping.interface';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-event-template-mapping-list',
  standalone: false,
  templateUrl: './event-template-mapping-list.component.html',
  styleUrl: './event-template-mapping-list.component.scss',
})
export class EventTemplateMappingListComponent implements OnInit {
  constructor(
    private eventTemplateMappingService: EventTemplateMappingService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: IEventTemplateMappingResponse[] = [];
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
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/notification-management/event-template-mapping-list' },
      { title: 'Event → Template Mapping', icon: 'fa-solid fa-diagram-project', href: '/notification-management/event-template-mapping-list' },
    ]);
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.eventTemplateMappingService.getAll().subscribe({
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

  deleteItem(item: IEventTemplateMappingResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Delete mapping for "${item.recruitmentEvent}" (${item.channel}/${item.recipientType})? This cannot be undone.`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-trash',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.eventTemplateMappingService.delete(item.eventTemplateMappingId).subscribe({
          next: () => this.loadItems(),
          error: (error) => {
            this.errorMessage = error?.error?.decentMessage || 'Failed to delete mapping.';
            this.cdr.detectChanges();
          },
        });
      },
    });
  }
}
