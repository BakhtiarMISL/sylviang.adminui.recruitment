import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamVenueService } from '@app/@core/services/recruitment/exam-venue/exam-venue.service';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-manage-exam-venue',
  standalone: false,
  templateUrl: './manage-exam-venue.component.html',
  styleUrl: './manage-exam-venue.component.scss',
})
export class ManageExamVenueComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private examVenueService: ExamVenueService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  venueForm!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  examVenueId: number | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.venueForm = this.fb.group({
      venueName: [null, [Validators.required, Validators.maxLength(200)]],
      location: [null, [Validators.required, Validators.maxLength(300)]],
    });

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.examVenueId = +idParam;
        this.isEditMode = true;
        this.loadVenue(this.examVenueId);
      } else {
        this.isEditMode = false;
        this.examVenueId = null;
      }
      this.setBreadcrumbs();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/exam-venues/exam-venue-list' },
      { title: 'Exam Venues', icon: 'fa-solid fa-building', href: '/exam-venues/exam-venue-list' },
      { title: this.isEditMode ? 'Edit Venue' : 'Add Venue', icon: 'fa-solid fa-edit', href: '/exam-venues/manage-exam-venue' },
    ]);
  }

  private loadVenue(id: number): void {
    this.examVenueService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.venueForm.patchValue({
            venueName: response.content.venueName,
            location: response.content.location,
          });
        } else {
          this.router.navigate(['/exam-venues/exam-venue-list']);
        }
      },
      error: () => {
        this.router.navigate(['/exam-venues/exam-venue-list']);
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

    if (this.isEditMode && this.examVenueId) {
      this.examVenueService.update(this.examVenueId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/exam-venues/exam-venue-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update exam venue';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update exam venue';
        },
      });
    } else {
      this.examVenueService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/exam-venues/exam-venue-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create exam venue';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create exam venue';
        },
      });
    }
  }
}
