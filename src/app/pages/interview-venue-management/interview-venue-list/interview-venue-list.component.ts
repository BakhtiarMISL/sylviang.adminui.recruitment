import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IInterviewVenueResponse } from '@app/@core/interfaces/recruitment-management/interview-venue.interface';
import { InterviewVenueService } from '@app/@core/services/recruitment/interview-venue/interview-venue.service';
import { BreadcrumbService } from '@app/@core/services';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-interview-venue-list',
  standalone: false,
  templateUrl: './interview-venue-list.component.html',
  styleUrl: './interview-venue-list.component.scss',
})
export class InterviewVenueListComponent implements OnInit {
  constructor(
    private interviewVenueService: InterviewVenueService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  venues: IInterviewVenueResponse[] = [];
  loading = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/interview-venues/interview-venue-list' },
      { title: 'Interview Venues', icon: 'fa-solid fa-building', href: '/interview-venues/interview-venue-list' },
    ]);
    this.loadVenues();
  }

  loadVenues(): void {
    this.loading = true;
    this.interviewVenueService.getAll().subscribe({
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

  manageRooms(venue: IInterviewVenueResponse): void {
    this.router.navigate(['/interview-venues/interview-venue', venue.interviewVenueId, 'rooms']);
  }

  toggleActiveStatus(venue: IInterviewVenueResponse, event: Event): void {
    const nextStatus = !venue.isActive;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to ${nextStatus ? 'activate' : 'deactivate'} interview venue: ${venue.venueName}?`,
      header: nextStatus ? 'Activate Confirmation' : 'Deactivate Confirmation',
      acceptButtonStyleClass: nextStatus ? 'p-button-success' : 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.interviewVenueService.setActiveStatus(venue.interviewVenueId, { isActive: nextStatus }).subscribe({
          next: () => this.loadVenues(),
          error: (error) => {
            console.error('Error updating interview venue status:', error);
          },
        });
      },
    });
  }
}
