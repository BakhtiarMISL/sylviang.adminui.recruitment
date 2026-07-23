import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamAttemptStatusEnum, QuestionTypeEnum } from '@app/@core/enums/recruitment.enum';
import { IExamPaperResponse, IExamSubmitResultResponse, IMyExamEnrollmentResponse } from '@app/@core/interfaces/recruitment-management/exam-taking.interface';
import { BreadcrumbService } from '@app/@core/services';
import { ExamTakingService } from '@app/@core/services/recruitment/exam-taking/exam-taking.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { ConfirmationService } from 'primeng/api';

type AttemptPhase = 'loading' | 'notStarted' | 'inProgress' | 'submitted' | 'error';

interface QuestionAnswer {
  selectedOptionIds?: number[];
  answerText?: string;
}

@Component({
  selector: 'app-exam-attempt',
  standalone: false,
  templateUrl: './exam-attempt.component.html',
  styleUrl: './exam-attempt.component.scss',
})
export class ExamAttemptComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examTakingService: ExamTakingService,
    private confirmationService: ConfirmationService,
    private toast: ToastService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  readonly QuestionTypeEnum = QuestionTypeEnum;

  enrollmentId!: number;
  phase: AttemptPhase = 'loading';
  errorMessage = '';

  myExam: IMyExamEnrollmentResponse | null = null;
  paper: IExamPaperResponse | null = null;
  submitResult: IExamSubmitResultResponse | null = null;

  answers: Record<number, QuestionAnswer> = {};

  starting = false;
  submitting = false;
  remainingSeconds = 0;
  private timerHandle: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'My Applications', icon: 'fa-solid fa-list-check', href: '/my-applications' },
      { title: 'Exam', icon: 'fa-solid fa-file-pen', href: '' },
    ]);

    const idParam = this.route.snapshot.paramMap.get('enrollmentId');
    this.enrollmentId = idParam ? +idParam : 0;
    if (!this.enrollmentId) {
      this.router.navigate(['/my-applications']);
      return;
    }

    this.load();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private load(): void {
    this.phase = 'loading';
    this.examTakingService.getMyEnrollments().subscribe({
      next: (response) => {
        const enrollments = response && !response.hasError ? response.content || [] : [];
        const found = enrollments.find((e) => e.examEnrollmentId === this.enrollmentId);

        if (!found) {
          this.phase = 'error';
          this.errorMessage = 'Exam not found, or it does not belong to you.';
          this.cdr.detectChanges();
          return;
        }

        this.myExam = found;

        if (found.attemptStatus === ExamAttemptStatusEnum.Submitted) {
          this.phase = 'submitted';
        } else if (found.attemptStatus === ExamAttemptStatusEnum.InProgress) {
          this.startExam(); // resume - already started server-side, safe to re-fetch the paper
        } else {
          this.phase = 'notStarted';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.phase = 'error';
        this.errorMessage = error?.error?.decentMessage || 'Failed to load exam.';
        this.cdr.detectChanges();
      },
    });
  }

  startExam(): void {
    this.starting = true;
    this.examTakingService.startExam(this.enrollmentId).subscribe({
      next: (response) => {
        this.starting = false;
        if (response.hasError || !response.content) {
          this.phase = 'error';
          this.errorMessage = response?.decentMessage || 'Failed to start exam.';
          this.cdr.detectChanges();
          return;
        }

        this.paper = response.content;
        this.phase = 'inProgress';
        this.startCountdown(this.paper.deadlineAt);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.starting = false;
        this.phase = 'error';
        this.errorMessage = error?.error?.decentMessage || 'Failed to start exam.';
        this.cdr.detectChanges();
      },
    });
  }

  private startCountdown(deadlineAt: string): void {
    this.clearTimer();
    const deadline = new Date(deadlineAt).getTime();

    const tick = () => {
      this.remainingSeconds = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      this.cdr.detectChanges();
      if (this.remainingSeconds <= 0) {
        this.clearTimer();
        this.doSubmit();
      }
    };

    tick();
    this.timerHandle = setInterval(tick, 1000);
  }

  private clearTimer(): void {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  get remainingTimeLabel(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // ── Answer capture ─────────────────────────────────────────────

  isSingleSelected(examQuestionId: number, optionId: number): boolean {
    return (this.answers[examQuestionId]?.selectedOptionIds || [])[0] === optionId;
  }

  selectSingleOption(examQuestionId: number, optionId: number): void {
    this.answers[examQuestionId] = { selectedOptionIds: [optionId] };
  }

  isMultiSelected(examQuestionId: number, optionId: number): boolean {
    return (this.answers[examQuestionId]?.selectedOptionIds || []).includes(optionId);
  }

  toggleMultiOption(examQuestionId: number, optionId: number): void {
    const current = this.answers[examQuestionId]?.selectedOptionIds || [];
    const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
    this.answers[examQuestionId] = { selectedOptionIds: next };
  }

  setAnswerText(examQuestionId: number, text: string): void {
    this.answers[examQuestionId] = { answerText: text };
  }

  getAnswerText(examQuestionId: number): string {
    return this.answers[examQuestionId]?.answerText || '';
  }

  // ── Submission ─────────────────────────────────────────────────

  confirmSubmit(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Submit your exam? You will not be able to change your answers after this.',
      header: 'Confirm Submission',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => this.doSubmit(),
    });
  }

  doSubmit(): void {
    if (this.submitting) return;

    this.submitting = true;
    const answers = Object.entries(this.answers).map(([examQuestionId, answer]) => ({
      examQuestionId: +examQuestionId,
      selectedOptionIds: answer.selectedOptionIds,
      answerText: answer.answerText,
    }));

    this.examTakingService.submitExam(this.enrollmentId, { answers }).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.hasError || !response.content) {
          this.toast.error({ detail: response?.decentMessage || 'Failed to submit exam.' });
          this.cdr.detectChanges();
          return;
        }

        this.clearTimer();
        this.submitResult = response.content;
        this.phase = 'submitted';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.submitting = false;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to submit exam.' });
        this.cdr.detectChanges();
      },
    });
  }
}
