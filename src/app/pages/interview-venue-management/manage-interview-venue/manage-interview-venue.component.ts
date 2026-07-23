import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewVenueService } from '@app/@core/services/recruitment/interview-venue/interview-venue.service';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-manage-interview-venue',
  standalone: false,
  templateUrl: './manage-interview-venue.component.html',
  styleUrl: './manage-interview-venue.component.scss',
})
export class ManageInterviewVenueComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private interviewVenueService: InterviewVenueService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  venueForm!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  interviewVenueId: number | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.venueForm = this.fb.group({
      venueName: [null, [Validators.required, Validators.maxLength(200)]],
      location: [null, [Validators.required, Validators.maxLength(300)]],
    });

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.interviewVenueId = +idParam;
        this.isEditMode = true;
        this.loadVenue(this.interviewVenueId);
      } else {
        this.isEditMode = false;
        this.interviewVenueId = null;
      }
      this.setBreadcrumbs();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/interview-venues/interview-venue-list' },
      { title: 'Interview Venues', icon: 'fa-solid fa-building', href: '/interview-venues/interview-venue-list' },
      {
        title: this.isEditMode ? 'Edit Venue' : 'Add Venue',
        icon: 'fa-solid fa-edit',
        href: '/interview-venues/manage-interview-venue',
      },
    ]);
  }

  private loadVenue(id: number): void {
    this.interviewVenueService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.venueForm.patchValue({
            venueName: response.content.venueName,
            location: response.content.location,
          });
        } else {
          this.router.navigate(['/interview-venues/interview-venue-list']);
        }
      },
      error: () => {
        this.router.navigate(['/interview-venues/interview-venue-list']);
      },
    });
  }

  get f() {
    return this.venueForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.venueForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.venueForm.invalid) {
      this.venueForm.markAllAsTouched();
      return;
    }

    const request = {
      venueName: this.venueForm.value.venueName,
      location: this.venueForm.value.location,
    };

    if (this.isEditMode && this.interviewVenueId) {
      this.interviewVenueService.update(this.interviewVenueId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/interview-venues/interview-venue-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update interview venue';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update interview venue';
        },
      });
    } else {
      this.interviewVenueService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/interview-venues/interview-venue-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create interview venue';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create interview venue';
        },
      });
    }
  }
}
