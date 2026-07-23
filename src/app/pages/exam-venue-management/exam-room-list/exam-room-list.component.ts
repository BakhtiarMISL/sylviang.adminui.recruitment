import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IExamRoomResponse } from '@app/@core/interfaces/recruitment-management/exam-room.interface';
import { ExamRoomService } from '@app/@core/services/recruitment/exam-room/exam-room.service';
import { ExamVenueService } from '@app/@core/services/recruitment/exam-venue/exam-venue.service';
import { BreadcrumbService } from '@app/@core/services';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-exam-room-list',
  standalone: false,
  templateUrl: './exam-room-list.component.html',
  styleUrl: './exam-room-list.component.scss',
})
export class ExamRoomListComponent implements OnInit {
  constructor(
    private examRoomService: ExamRoomService,
    private examVenueService: ExamVenueService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  examVenueId!: number;
  venueName = '';
  rooms: IExamRoomResponse[] = [];
  loading = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.examVenueId = +params.get('venueId')!;
      this.loadVenueName();
      this.loadRooms();
    });
  }

  private loadVenueName(): void {
    this.examVenueService.getById(this.examVenueId).subscribe({
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
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/exam-venues/exam-venue-list' },
      { title: 'Exam Venues', icon: 'fa-solid fa-building', href: '/exam-venues/exam-venue-list' },
      { title: this.venueName || 'Rooms', icon: 'fa-solid fa-door-open', href: `/exam-venues/exam-venue/${this.examVenueId}/rooms` },
    ]);
  }

  loadRooms(): void {
    this.loading = true;
    this.examRoomService.getAllByVenue(this.examVenueId).subscribe({
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

  toggleActiveStatus(room: IExamRoomResponse, event: Event): void {
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
        this.examRoomService.setActiveStatus(this.examVenueId, room.examRoomId, { isActive: nextStatus }).subscribe({
          next: () => this.loadRooms(),
          error: (error) => {
            console.error('Error updating room status:', error);
          },
        });
      },
    });
  }
}
