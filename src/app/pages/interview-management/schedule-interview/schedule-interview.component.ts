import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UI_CONFIG } from '@app/@core/constants';
import { ApplicationStatusEnum, InterviewTypeEnum } from '@app/@core/enums/recruitment.enum';
import { IInterviewRoomResponse } from '@app/@core/interfaces/recruitment-management/interview-room.interface';
import { IInterviewVenueLookupResponse } from '@app/@core/interfaces/recruitment-management/interview-venue.interface';
import { IJobApplicationListItem } from '@app/@core/interfaces/recruitment-management/job-application.interface';
import { IJobVacancyResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy.interface';
import { BreadcrumbService } from '@app/@core/services';
import { InterviewService } from '@app/@core/services/recruitment/interview/interview.service';
import { InterviewRoomService } from '@app/@core/services/recruitment/interview-room/interview-room.service';
import { InterviewVenueService } from '@app/@core/services/recruitment/interview-venue/interview-venue.service';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { JobVacancyService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { InterviewTypeOptions } from './schedule-interview.component.constants';

@Component({
  selector: 'app-schedule-interview',
  standalone: false,
  templateUrl: './schedule-interview.component.html',
  styleUrl: './schedule-interview.component.scss',
})
export class ScheduleInterviewComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private interviewService: InterviewService,
    private interviewVenueService: InterviewVenueService,
    private interviewRoomService: InterviewRoomService,
    private jobVacancyService: JobVacancyService,
    private jobApplicationService: JobApplicationService,
    private toast: ToastService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  scheduleForm!: FormGroup;
  formSubmitted = false;
  errorMessage = '';
  submitting = false;

  readonly InterviewTypeEnum = InterviewTypeEnum;
  interviewTypeOptions = InterviewTypeOptions;

  jobPostings: IJobVacancyResponse[] = [];
  interviewVenues: IInterviewVenueLookupResponse[] = [];
  interviewRooms: IInterviewRoomResponse[] = [];

  // Candidate picker - stays disabled/empty until a job posting is picked. Multi-select: 1
  // candidate selected => single schedule, 2+ => bulk schedule staggered by duration+gap.
  candidates: IJobApplicationListItem[] = [];
  selectedCandidates: IJobApplicationListItem[] = [];
  candidatesLoading = false;
  candidatesTotalRecords = 0;
  UI_CONFIG = UI_CONFIG;
  candidateRows = UI_CONFIG.defaultPageSize;
  candidateCurrentPage = 1;

  get skeletonItems() {
    return Array(this.candidateRows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/interviews/interview-list' },
      { title: 'Interviews', icon: 'fa-solid fa-people-arrows', href: '/interviews/interview-list' },
      { title: 'Schedule Interview', icon: 'fa-solid fa-plus', href: '/interviews/schedule-interview' },
    ]);

    this.scheduleForm = this.fb.group({
      jobPostingId: [null, [Validators.required]],
      interviewType: [InterviewTypeEnum.InPerson, [Validators.required]],
      interviewVenueId: [null],
      interviewRoomId: [null],
      meetingLink: [null],
      scheduledStartAt: [null, [Validators.required]],
      durationMinutes: [30, [Validators.required, Validators.min(1)]],
      gapMinutes: [15, [Validators.required, Validators.min(0)]],
      round: [1, [Validators.required, Validators.min(1)]],
      panelistEmployeeIdsText: [null],
      notes: [null],
    });

    this.onInterviewTypeChange();

    this.loadJobPostings();
    this.loadInterviewVenues();
  }

  get f() {
    return this.scheduleForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.scheduleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  get isInPerson(): boolean {
    return this.scheduleForm?.value?.interviewType === InterviewTypeEnum.InPerson;
  }

  get isBulk(): boolean {
    return this.selectedCandidates.length > 1;
  }

  onInterviewTypeChange(): void {
    const roomControl = this.scheduleForm.get('interviewRoomId');
    const meetingLinkControl = this.scheduleForm.get('meetingLink');
    if (this.isInPerson) {
      roomControl?.setValidators([Validators.required]);
      meetingLinkControl?.clearValidators();
      meetingLinkControl?.setValue(null);
    } else {
      meetingLinkControl?.setValidators([Validators.required]);
      roomControl?.clearValidators();
      roomControl?.setValue(null);
      this.scheduleForm.get('interviewVenueId')?.setValue(null);
      this.interviewRooms = [];
    }
    roomControl?.updateValueAndValidity({ emitEvent: false });
    meetingLinkControl?.updateValueAndValidity({ emitEvent: false });
  }

  onVenueChange(): void {
    this.scheduleForm.get('interviewRoomId')?.setValue(null);
    const venueId = this.scheduleForm.value.interviewVenueId;
    if (!venueId) {
      this.interviewRooms = [];
      return;
    }
    this.interviewRoomService.getAllByVenue(venueId).subscribe({
      next: (response) => {
        this.interviewRooms = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  private loadJobPostings(): void {
    this.jobVacancyService.getAllJobVacancies().subscribe({
      next: (response) => {
        this.jobPostings = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  private loadInterviewVenues(): void {
    this.interviewVenueService.getLookup().subscribe({
      next: (response) => {
        this.interviewVenues = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  onJobPostingChange(): void {
    this.selectedCandidates = [];
    this.candidates = [];
    this.candidatesTotalRecords = 0;
    this.candidateCurrentPage = 1;
    if (this.scheduleForm.value.jobPostingId) {
      this.loadCandidates();
    }
  }

  loadCandidates(): void {
    const jobPostingId = this.scheduleForm.value.jobPostingId;
    if (!jobPostingId) return;

    this.candidatesLoading = true;
    const params = {
      jobPostingId,
      status: ApplicationStatusEnum.Shortlisted,
      page: this.candidateCurrentPage,
      pageSize: this.candidateRows,
    };

    this.jobApplicationService.getDashboardPaged(params).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.candidates = response.content.data || [];
          this.candidatesTotalRecords = response.content.totalCount || 0;
        } else {
          this.candidates = [];
          this.candidatesTotalRecords = 0;
        }
        this.candidatesLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.candidates = [];
        this.candidatesTotalRecords = 0;
        this.candidatesLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onCandidatePageChange(event: any): void {
    this.candidateCurrentPage = Math.floor(event.first / event.rows) + 1;
    this.candidateRows = event.rows;
    this.loadCandidates();
  }

  private parsePanelistIds(): number[] {
    const text: string | null = this.scheduleForm.value.panelistEmployeeIdsText;
    if (!text) return [];
    return text
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => +s)
      .filter((n) => !isNaN(n));
  }

  get canSubmit(): boolean {
    return this.scheduleForm.valid && this.selectedCandidates.length > 0 && !this.submitting;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    if (this.selectedCandidates.length === 0) {
      this.errorMessage = 'Select at least one shortlisted candidate to schedule.';
      return;
    }

    const start: Date = this.scheduleForm.value.scheduledStartAt;
    const startIso = start instanceof Date ? start.toISOString() : start;
    const panelistEmployeeIds = this.parsePanelistIds();

    this.submitting = true;

    if (!this.isBulk) {
      const candidate = this.selectedCandidates[0];
      const durationMinutes: number = this.scheduleForm.value.durationMinutes;
      const scheduledEndAt = new Date(new Date(startIso).getTime() + durationMinutes * 60000).toISOString();

      const request = {
        jobApplicationId: candidate.jobApplicationId,
        interviewType: this.scheduleForm.value.interviewType,
        interviewVenueId: this.isInPerson ? this.scheduleForm.value.interviewVenueId : null,
        interviewRoomId: this.isInPerson ? this.scheduleForm.value.interviewRoomId : null,
        meetingLink: this.isInPerson ? null : this.scheduleForm.value.meetingLink,
        scheduledStartAt: startIso,
        scheduledEndAt,
        round: this.scheduleForm.value.round,
        panelistEmployeeIds,
        notes: this.scheduleForm.value.notes,
      };

      this.interviewService.schedule(request).subscribe({
        next: (response) => {
          this.submitting = false;
          if (response.hasError || !response.content) {
            this.errorMessage = response?.decentMessage || 'Failed to schedule interview.';
            return;
          }
          this.toast.success({ detail: 'Interview scheduled.' });
          this.router.navigate(['/interviews/interview', response.content]);
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error?.error?.decentMessage || 'Failed to schedule interview.';
        },
      });
    } else {
      const request = {
        jobApplicationIds: this.selectedCandidates.map((c) => c.jobApplicationId),
        interviewType: this.scheduleForm.value.interviewType,
        interviewVenueId: this.isInPerson ? this.scheduleForm.value.interviewVenueId : null,
        interviewRoomId: this.isInPerson ? this.scheduleForm.value.interviewRoomId : null,
        meetingLink: this.isInPerson ? null : this.scheduleForm.value.meetingLink,
        startAt: startIso,
        durationMinutes: this.scheduleForm.value.durationMinutes,
        gapMinutes: this.scheduleForm.value.gapMinutes,
        round: this.scheduleForm.value.round,
        panelistEmployeeIds,
        notes: this.scheduleForm.value.notes,
      };

      this.interviewService.bulkSchedule(request).subscribe({
        next: (response) => {
          this.submitting = false;
          if (response.hasError || !response.content) {
            this.errorMessage = response?.decentMessage || 'Failed to schedule interviews.';
            return;
          }
          this.toast.success({ detail: `${response.content.length} interview(s) scheduled.` });
          this.router.navigate(['/interviews/interview-list']);
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error?.error?.decentMessage || 'Failed to schedule interviews.';
        },
      });
    }
  }
}
