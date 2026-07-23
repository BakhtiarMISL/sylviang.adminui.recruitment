import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UI_CONFIG } from '@app/@core/constants';
import { ApplicationStatusEnum, ExamTypeEnum } from '@app/@core/enums/recruitment.enum';
import { IExamVenueLookupResponse } from '@app/@core/interfaces/recruitment-management/exam-venue.interface';
import { IJobApplicationListItem } from '@app/@core/interfaces/recruitment-management/job-application.interface';
import { IJobVacancyResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy.interface';
import { IQuestionGroupLookupResponse } from '@app/@core/interfaces/recruitment-management/question-group.interface';
import { BreadcrumbService } from '@app/@core/services';
import { ExamService } from '@app/@core/services/recruitment/exam/exam.service';
import { ExamVenueService } from '@app/@core/services/recruitment/exam-venue/exam-venue.service';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { JobVacancyService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy.service';
import { QuestionGroupService } from '@app/@core/services/recruitment/question-group/question-group.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { ExamTypeOptions } from './schedule-exam.component.constants';

@Component({
  selector: 'app-schedule-exam',
  standalone: false,
  templateUrl: './schedule-exam.component.html',
  styleUrl: './schedule-exam.component.scss',
})
export class ScheduleExamComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private examVenueService: ExamVenueService,
    private questionGroupService: QuestionGroupService,
    private jobVacancyService: JobVacancyService,
    private jobApplicationService: JobApplicationService,
    private toast: ToastService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  examForm!: FormGroup;
  formSubmitted = false;
  errorMessage = '';
  submitting = false;

  readonly ExamTypeEnum = ExamTypeEnum;
  examTypeOptions = ExamTypeOptions;

  jobPostings: IJobVacancyResponse[] = [];
  examVenues: IExamVenueLookupResponse[] = [];
  questionGroups: IQuestionGroupLookupResponse[] = [];

  // Candidate picker (section 2) - stays disabled/empty until a job posting is picked.
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
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/exams/exam-list' },
      { title: 'Exams', icon: 'fa-solid fa-file-pen', href: '/exams/exam-list' },
      { title: 'Schedule Exam', icon: 'fa-solid fa-plus', href: '/exams/schedule-exam' },
    ]);

    this.examForm = this.fb.group({
      jobPostingId: [null, [Validators.required]],
      title: [null, [Validators.required, Validators.maxLength(200)]],
      scheduledStartAt: [null, [Validators.required]],
      durationMinutes: [60, [Validators.required, Validators.min(1)]],
      totalMarks: [100, [Validators.required, Validators.min(1)]],
      passMarks: [40, [Validators.required, Validators.min(0)]],
      examType: [ExamTypeEnum.InPerson, [Validators.required]],
      examVenueId: [null],
      questionGroupId: [null],
    });

    this.onExamTypeChange();

    this.loadJobPostings();
    this.loadExamVenues();
    this.loadQuestionGroups();
  }

  get f() {
    return this.examForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.examForm.get(fieldName);
    if (!field) return false;
    if (fieldName === 'passMarks' && this.passMarksExceedsTotal) return field.dirty || field.touched || this.formSubmitted;
    return !!(field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  get passMarksExceedsTotal(): boolean {
    const totalMarks = this.examForm?.value?.totalMarks;
    const passMarks = this.examForm?.value?.passMarks;
    return totalMarks != null && passMarks != null && passMarks > totalMarks;
  }

  get isInPerson(): boolean {
    return this.examForm?.value?.examType === ExamTypeEnum.InPerson;
  }

  onExamTypeChange(): void {
    const examVenueControl = this.examForm.get('examVenueId');
    const questionGroupControl = this.examForm.get('questionGroupId');
    if (this.isInPerson) {
      examVenueControl?.setValidators([Validators.required]);
      questionGroupControl?.clearValidators();
      questionGroupControl?.setValue(null);
    } else {
      questionGroupControl?.setValidators([Validators.required]);
      examVenueControl?.clearValidators();
      examVenueControl?.setValue(null);
    }
    examVenueControl?.updateValueAndValidity({ emitEvent: false });
    questionGroupControl?.updateValueAndValidity({ emitEvent: false });
  }

  private loadJobPostings(): void {
    this.jobVacancyService.getAllJobVacancies().subscribe({
      next: (response) => {
        this.jobPostings = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  private loadExamVenues(): void {
    this.examVenueService.getLookup().subscribe({
      next: (response) => {
        this.examVenues = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  private loadQuestionGroups(): void {
    this.questionGroupService.getLookup().subscribe({
      next: (response) => {
        this.questionGroups = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  onJobPostingChange(): void {
    this.selectedCandidates = [];
    this.candidates = [];
    this.candidatesTotalRecords = 0;
    this.candidateCurrentPage = 1;
    if (this.examForm.value.jobPostingId) {
      this.loadCandidates();
    }
  }

  loadCandidates(): void {
    const jobPostingId = this.examForm.value.jobPostingId;
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

  get canSubmit(): boolean {
    return this.examForm.valid && !this.passMarksExceedsTotal && this.selectedCandidates.length > 0 && !this.submitting;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.examForm.invalid || this.passMarksExceedsTotal) {
      this.examForm.markAllAsTouched();
      if (this.passMarksExceedsTotal) this.errorMessage = 'Pass marks cannot exceed total marks.';
      return;
    }

    if (this.selectedCandidates.length === 0) {
      this.errorMessage = 'Select at least one shortlisted candidate to enroll.';
      return;
    }

    const scheduledStartAt: Date = this.examForm.value.scheduledStartAt;

    const request = {
      jobPostingId: this.examForm.value.jobPostingId,
      title: this.examForm.value.title,
      scheduledStartAt: scheduledStartAt instanceof Date ? scheduledStartAt.toISOString() : scheduledStartAt,
      durationMinutes: this.examForm.value.durationMinutes,
      totalMarks: this.examForm.value.totalMarks,
      passMarks: this.examForm.value.passMarks,
      examType: this.examForm.value.examType,
      examVenueId: this.isInPerson ? this.examForm.value.examVenueId : null,
      questionGroupId: this.isInPerson ? null : this.examForm.value.questionGroupId,
    };

    this.submitting = true;

    this.examService.create(request).subscribe({
      next: (createResponse) => {
        if (createResponse.hasError || !createResponse.content) {
          this.submitting = false;
          this.errorMessage = createResponse?.decentMessage || 'Failed to schedule exam.';
          return;
        }

        const examId = createResponse.content;
        const jobApplicationIds = this.selectedCandidates.map((c) => c.jobApplicationId);

        this.examService.enroll(examId, jobApplicationIds).subscribe({
          next: (enrollResponse) => {
            this.submitting = false;
            if (enrollResponse.hasError) {
              this.toast.error({ detail: enrollResponse?.decentMessage || 'Exam scheduled, but enrollment failed.' });
            } else {
              this.toast.success({ detail: 'Exam scheduled and candidates enrolled.' });
            }
            this.router.navigate(['/exams/exam', examId]);
          },
          error: (error) => {
            this.submitting = false;
            this.toast.error({ detail: error?.error?.decentMessage || 'Exam scheduled, but enrollment failed.' });
            this.router.navigate(['/exams/exam', examId]);
          },
        });
      },
      error: (error) => {
        this.submitting = false;
        this.errorMessage = error?.error?.decentMessage || 'Failed to schedule exam.';
      },
    });
  }
}
