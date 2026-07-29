import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IInterviewRoomResponse } from '@app/@core/interfaces/recruitment-management/interview-room.interface';
import { InterviewRoomService } from '@app/@core/services/recruitment/interview-room/interview-room.service';
import { InterviewVenueService } from '@app/@core/services/recruitment/interview-venue/interview-venue.service';
import { BreadcrumbService } from '@app/@core/services';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-interview-room-list',
  standalone: false,
  templateUrl: './interview-room-list.component.html',
  styleUrl: './interview-room-list.component.scss',
})
export class InterviewRoomListComponent implements OnInit {
  constructor(
    private interviewRoomService: InterviewRoomService,
    private interviewVenueService: InterviewVenueService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  interviewVenueId!: number;
  venueName = '';
  rooms: IInterviewRoomResponse[] = [];
  loading = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.interviewVenueId = +params.get('venueId')!;
      this.loadVenueName();
      this.loadRooms();
    });
  }

  private loadVenueName(): void {
    this.interviewVenueService.getById(this.interviewVenueId).subscribe({
      next: (response) => {
        this.venueName = response && !response.hasError && response.content ? response.content.venueName : '';
        this.setBreadcrumbs();
        this.cdr.detectChanges();
      },
      error: () => {
        this.setBreadcrumbs();
      },
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/interview-venues/interview-venue-list' },
      { title: 'Interview Venues', icon: 'fa-solid fa-building', href: '/interview-venues/interview-venue-list' },
      {
        title: this.venueName || 'Rooms',
        icon: 'fa-solid fa-door-open',
        href: `/interview-venues/interview-venue/${this.interviewVenueId}/rooms`,
      },
    ]);
  }

  loadRooms(): void {
    this.loading = true;
    this.interviewRoomService.getAllByVenue(this.interviewVenueId).subscribe({
      next: (response) => {
        this.rooms = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.rooms = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleActiveStatus(room: IInterviewRoomResponse, event: Event): void {
    const nextStatus = !room.isActive;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to ${nextStatus ? 'activate' : 'deactivate'} room: ${room.roomName}?`,
      header: nextStatus ? 'Activate Confirmation' : 'Deactivate Confirmation',
      acceptButtonStyleClass: nextStatus ? 'p-button-success' : 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.interviewRoomService.setActiveStatus(this.interviewVenueId, room.interviewRoomId, { isActive: nextStatus }).subscribe({
          next: () => this.loadRooms(),
          error: (error) => {
            console.error('Error updating room status:', error);
          },
        });
      },
    });
  }
}
