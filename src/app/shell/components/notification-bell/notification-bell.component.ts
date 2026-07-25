import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { INotificationLogResponse } from '@core/interfaces/recruitment-management/notification-log.interface';
import { NotificationLogService } from '@core/services/recruitment/notification-log/notification-log.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { interval, startWith } from 'rxjs';

const POLL_INTERVAL_MS = 30000;

@UntilDestroy()
@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
  standalone: false,
})
export class NotificationBellComponent implements OnInit {
  unreadCount = 0;
  panelOpen = false;
  loading = false;
  items: INotificationLogResponse[] = [];

  constructor(
    private readonly _eRef: ElementRef,
    private notificationLogService: NotificationLogService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    interval(POLL_INTERVAL_MS)
      .pipe(startWith(0), untilDestroyed(this))
      .subscribe(() => this.refreshUnreadCount());
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
    if (this.panelOpen) {
      this.loadUnread();
    }
  }

  openItem(item: INotificationLogResponse): void {
    if (!item.isRead) {
      this.notificationLogService.markRead(item.notificationLogId).subscribe();
      item.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
    this.panelOpen = false;
    if (item.jobApplicationId) {
      this.router.navigate(['/applications', item.jobApplicationId]);
    }
  }

  markAllRead(): void {
    this.notificationLogService.markAllRead().subscribe({
      next: () => {
        this.items = this.items.map((item) => ({ ...item, isRead: true }));
        this.unreadCount = 0;
      },
    });
  }

  eventLabel(item: INotificationLogResponse): string {
    return item.renderedSubject || item.recruitmentEvent;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this._eRef.nativeElement.contains(event.target)) {
      this.panelOpen = false;
    }
  }

  private refreshUnreadCount(): void {
    this.notificationLogService.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadCount = !response.hasError && response.content !== undefined && response.content !== null ? response.content : 0;
      },
    });
  }

  private loadUnread(): void {
    this.loading = true;
    this.notificationLogService.getUnread().subscribe({
      next: (response) => {
        this.items = !response.hasError && response.content ? response.content : [];
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      },
    });
  }
}
