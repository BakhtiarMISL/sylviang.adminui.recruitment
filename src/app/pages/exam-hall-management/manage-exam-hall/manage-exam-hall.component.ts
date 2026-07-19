import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamHallService } from '@app/@core/services/recruitment/exam-hall/exam-hall.service';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-manage-exam-hall',
  standalone: false,
  templateUrl: './manage-exam-hall.component.html',
  styleUrl: './manage-exam-hall.component.scss',
})
export class ManageExamHallComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private examHallService: ExamHallService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  hallForm!: FormGroup;
  formSubmitted = false;
  isEditMode = false;
  examHallId: number | null = null;
  errorMessage = '';
  invigilatorEmployeeIds: number[] = [];

  ngOnInit(): void {
    this.hallForm = this.fb.group({
      hallName: [null, [Validators.required, Validators.maxLength(200)]],
      location: [null, [Validators.required, Validators.maxLength(300)]],
      totalCapacity: [null, [Validators.required, Validators.min(1)]],
      notifyInvigilatorsOnAssign: [true],
    });

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.examHallId = +idParam;
        this.isEditMode = true;
        this.loadHall(this.examHallId);
      } else {
        this.isEditMode = false;
        this.examHallId = null;
      }
      this.setBreadcrumbs();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/exam-halls/exam-hall-list' },
      { title: 'Exam Halls', icon: 'fa-solid fa-door-open', href: '/exam-halls/exam-hall-list' },
      { title: this.isEditMode ? 'Edit Hall' : 'Add Hall', icon: 'fa-solid fa-edit', href: '/exam-halls/manage-exam-hall' },
    ]);
  }

  private loadHall(id: number): void {
    this.examHallService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.hallForm.patchValue({
            hallName: response.content.hallName,
            location: response.content.location,
            totalCapacity: response.content.totalCapacity,
            notifyInvigilatorsOnAssign: response.content.notifyInvigilatorsOnAssign,
          });
          this.invigilatorEmployeeIds = response.content.invigilatorEmployeeIds;
        } else {
          this.router.navigate(['/exam-halls/exam-hall-list']);
        }
      },
      error: () => {
        this.router.navigate(['/exam-halls/exam-hall-list']);
      },
    });
  }

  get f() {
    return this.hallForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.hallForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  onInvigilatorIdsBlur(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.invigilatorEmployeeIds = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n));
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.hallForm.invalid) {
      this.hallForm.markAllAsTouched();
      return;
    }

    const request = {
      hallName: this.hallForm.value.hallName,
      location: this.hallForm.value.location,
      totalCapacity: this.hallForm.value.totalCapacity,
      notifyInvigilatorsOnAssign: this.hallForm.value.notifyInvigilatorsOnAssign,
      invigilatorEmployeeIds: this.invigilatorEmployeeIds,
    };

    if (this.isEditMode && this.examHallId) {
      this.examHallService.update(this.examHallId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/exam-halls/exam-hall-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update exam hall';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update exam hall';
        },
      });
    } else {
      this.examHallService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/exam-halls/exam-hall-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create exam hall';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create exam hall';
        },
      });
    }
  }
}
