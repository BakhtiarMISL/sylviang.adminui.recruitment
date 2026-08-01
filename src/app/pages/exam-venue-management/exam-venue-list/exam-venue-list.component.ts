import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IExamVenueResponse } from '@app/@core/interfaces/recruitment-management/exam-venue.interface';
import { ExamVenueService } from '@app/@core/services/recruitment/exam-venue/exam-venue.service';
import { BreadcrumbService } from '@app/@core/services';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-exam-venue-list',
  standalone: false,
  templateUrl: './exam-venue-list.component.html',
  styleUrl: './exam-venue-list.component.scss',
})
export class ExamVenueListComponent implements OnInit {
  constructor(
    private examVenueService: ExamVenueService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  venues: IExamVenueResponse[] = [];
  loading = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/exam-venues/exam-venue-list' },
      { title: 'Exam Venues', icon: 'fa-solid fa-building', href: '/exam-venues/exam-venue-list' },
    ]);
    this.loadVenues();
  }

  loadVenues(): void {
    this.loading = true;
    this.examVenueService.getAll().subscribe({
      next: (response) => {
        this.venues = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.venues = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  manageRooms(venue: IExamVenueResponse): void {
    this.router.navigate(['/exam-venues/exam-venue', venue.examVenueId, 'rooms']);
  }

  toggleActiveStatus(venue: IExamVenueResponse, event: Event): void {
    const nextStatus = !venue.isActive;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to ${nextStatus ? 'activate' : 'deactivate'} exam venue: ${venue.venueName}?`,
      header: nextStatus ? 'Activate Confirmation' : 'Deactivate Confirmation',
      acceptButtonStyleClass: nextStatus ? 'p-button-success' : 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.examVenueService.setActiveStatus(venue.examVenueId, { isActive: nextStatus }).subscribe({
          next: () => this.loadVenues(),
          error: (error) => {
            console.error('Error updating exam venue status:', error);
          },
        });
      },
    });
  }
}
