import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamRoomService } from '@app/@core/services/recruitment/exam-room/exam-room.service';
import { ExamVenueService } from '@app/@core/services/recruitment/exam-venue/exam-venue.service';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-manage-exam-room',
  standalone: false,
  templateUrl: './manage-exam-room.component.html',
  styleUrl: './manage-exam-room.component.scss',
})
export class ManageExamRoomComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private examRoomService: ExamRoomService,
    private examVenueService: ExamVenueService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  roomForm!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  examVenueId!: number;
  examRoomId: number | null = null;
  venueName = '';
  errorMessage = '';
  requiredInvigilatorCount = 0;

  ngOnInit(): void {
    this.roomForm = this.fb.group({
      roomName: [null, [Validators.required, Validators.maxLength(200)]],
      capacity: [null, [Validators.required, Validators.min(1)]],
    });

    this.route.paramMap.subscribe((params) => {
      this.examVenueId = +params.get('venueId')!;
      const idParam = params.get('id');
      if (idParam) {
        this.examRoomId = +idParam;
        this.isEditMode = true;
        this.loadRoom(this.examRoomId);
      } else {
        this.isEditMode = false;
        this.examRoomId = null;
      }
      this.loadVenueName();
    });
  }

  private loadVenueName(): void {
    this.examVenueService.getById(this.examVenueId).subscribe({
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
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/exam-venues/exam-venue-list' },
      { title: 'Exam Venues', icon: 'fa-solid fa-building', href: '/exam-venues/exam-venue-list' },
      { title: this.venueName || 'Rooms', icon: 'fa-solid fa-door-open', href: `/exam-venues/exam-venue/${this.examVenueId}/rooms` },
      {
        title: this.isEditMode ? 'Edit Room' : 'Add Room',
        icon: 'fa-solid fa-edit',
        href: `/exam-venues/exam-venue/${this.examVenueId}/manage-room`,
      },
    ]);
  }

  private loadRoom(id: number): void {
    this.examRoomService.getById(this.examVenueId, id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.roomForm.patchValue({
            roomName: response.content.roomName,
            capacity: response.content.capacity,
          });
          this.requiredInvigilatorCount = response.content.requiredInvigilatorCount;
        } else {
          this.router.navigate(['/exam-venues/exam-venue', this.examVenueId, 'rooms']);
        }
      },
      error: () => {
        this.router.navigate(['/exam-venues/exam-venue', this.examVenueId, 'rooms']);
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

  incrementRequiredInvigilatorCount(): void {
    this.requiredInvigilatorCount++;
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
      requiredInvigilatorCount: this.requiredInvigilatorCount,
    };

    if (this.isEditMode && this.examRoomId) {
      this.examRoomService.update(this.examVenueId, this.examRoomId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/exam-venues/exam-venue', this.examVenueId, 'rooms']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update room';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update room';
        },
      });
    } else {
      this.examRoomService.create(this.examVenueId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/exam-venues/exam-venue', this.examVenueId, 'rooms']);
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
