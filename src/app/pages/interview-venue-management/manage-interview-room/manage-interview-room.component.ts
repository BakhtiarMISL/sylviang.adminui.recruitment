import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewRoomService } from '@app/@core/services/recruitment/interview-room/interview-room.service';
import { InterviewVenueService } from '@app/@core/services/recruitment/interview-venue/interview-venue.service';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-manage-interview-room',
  standalone: false,
  templateUrl: './manage-interview-room.component.html',
  styleUrl: './manage-interview-room.component.scss',
})
export class ManageInterviewRoomComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private interviewRoomService: InterviewRoomService,
    private interviewVenueService: InterviewVenueService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  roomForm!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  interviewVenueId!: number;
  interviewRoomId: number | null = null;
  venueName = '';
  errorMessage = '';

  ngOnInit(): void {
    this.roomForm = this.fb.group({
      roomName: [null, [Validators.required, Validators.maxLength(200)]],
      capacity: [null, [Validators.required, Validators.min(1)]],
    });

    this.route.paramMap.subscribe((params) => {
      this.interviewVenueId = +params.get('venueId')!;
      const idParam = params.get('id');
      if (idParam) {
        this.interviewRoomId = +idParam;
        this.isEditMode = true;
        this.loadRoom(this.interviewRoomId);
      } else {
        this.isEditMode = false;
        this.interviewRoomId = null;
      }
      this.loadVenueName();
    });
  }

  private loadVenueName(): void {
    this.interviewVenueService.getById(this.interviewVenueId).subscribe({
      next: (response) => {
        this.venueName = response && !response.hasError && response.content ? response.content.venueName : '';
        this.setBreadcrumbs();
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
      {
        title: this.isEditMode ? 'Edit Room' : 'Add Room',
        icon: 'fa-solid fa-edit',
        href: `/interview-venues/interview-venue/${this.interviewVenueId}/manage-room`,
      },
    ]);
  }

  private loadRoom(id: number): void {
    this.interviewRoomService.getById(this.interviewVenueId, id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.roomForm.patchValue({
            roomName: response.content.roomName,
            capacity: response.content.capacity,
          });
        } else {
          this.router.navigate(['/interview-venues/interview-venue', this.interviewVenueId, 'rooms']);
        }
      },
      error: () => {
        this.router.navigate(['/interview-venues/interview-venue', this.interviewVenueId, 'rooms']);
      },
    });
  }

  get f() {
    return this.roomForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.roomForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    const request = {
      roomName: this.roomForm.value.roomName,
      capacity: this.roomForm.value.capacity,
    };

    if (this.isEditMode && this.interviewRoomId) {
      this.interviewRoomService.update(this.interviewVenueId, this.interviewRoomId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/interview-venues/interview-venue', this.interviewVenueId, 'rooms']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update room';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update room';
        },
      });
    } else {
      this.interviewRoomService.create(this.interviewVenueId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/interview-venues/interview-venue', this.interviewVenueId, 'rooms']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create room';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create room';
        },
      });
    }
  }
}
