import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewResultEnum, InterviewStatusEnum, InterviewTypeEnum } from '@app/@core/enums/recruitment.enum';
import { IInterviewResponse } from '@app/@core/interfaces/recruitment-management/interview.interface';
import { BreadcrumbService } from '@app/@core/services';
import { InterviewService } from '@app/@core/services/recruitment/interview/interview.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-interview-detail',
  standalone: false,
  templateUrl: './interview-detail.component.html',
  styleUrl: './interview-detail.component.scss',
})
export class InterviewDetailComponent implements OnInit {
  constructor(
    private interviewService: InterviewService,
    private toast: ToastService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  readonly InterviewTypeEnum = InterviewTypeEnum;
  readonly InterviewStatusEnum = InterviewStatusEnum;
  readonly InterviewResultEnum = InterviewResultEnum;

  interviewId!: number;
  interview: IInterviewResponse | null = null;
  loading = false;

  // Reschedule dialog
  rescheduleDialogVisible = false;
  rescheduleStartAt: Date | null = null;
  rescheduleSaving = false;

  // Cancel dialog
  cancelDialogVisible = false;
  cancelReason = '';
  cancelSaving = false;

  // Mark Result dialog
  markResultDialogVisible = false;
  markResultValue: InterviewResultEnum | null = null;
  markResultSaving = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (!idParam) {
        this.router.navigate(['/interviews/interview-list']);
        return;
      }
      this.interviewId = +idParam;
      this.loadInterview();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/interviews/interview-list' },
      { title: 'Interviews', icon: 'fa-solid fa-people-arrows', href: '/interviews/interview-list' },
      { title: this.interview?.candidateName || 'Interview Detail', icon: 'fa-solid fa-circle-info', href: `/interviews/interview/${this.interviewId}` },
    ]);
  }

  loadInterview(): void {
    this.loading = true;
    this.interviewService.getById(this.interviewId).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.interview = response.content;
        } else {
          this.router.navigate(['/interviews/interview-list']);
        }
        this.loading = false;
        this.setBreadcrumbs();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/interviews/interview-list']);
      },
    });
  }

  get isCancelled(): boolean {
    return this.interview?.status === InterviewStatusEnum.Cancelled;
  }

  // ── Reschedule ─────────────────────────────────────────────────

  openRescheduleDialog(): void {
    if (!this.interview) return;
    this.rescheduleStartAt = new Date(this.interview.scheduledStartAt);
    this.rescheduleDialogVisible = true;
  }

  closeRescheduleDialog(): void {
    this.rescheduleDialogVisible = false;
    this.rescheduleStartAt = null;
  }

  get canSaveReschedule(): boolean {
    return !!this.rescheduleStartAt && !this.rescheduleSaving;
  }

  saveReschedule(): void {
    if (!this.interview || !this.rescheduleStartAt) return;

    const originalDurationMs = new Date(this.interview.scheduledEndAt).getTime() - new Date(this.interview.scheduledStartAt).getTime();
    const newStart = this.rescheduleStartAt;
    const newEnd = new Date(newStart.getTime() + originalDurationMs);

    this.rescheduleSaving = true;
    this.interviewService
      .reschedule(this.interviewId, {
        scheduledStartAt: newStart.toISOString(),
        scheduledEndAt: newEnd.toISOString(),
      })
      .subscribe({
        next: (response) => {
          this.rescheduleSaving = false;
          if (response.hasError) {
            this.toast.error({ detail: response?.decentMessage || 'Failed to reschedule interview.' });
          } else {
            this.toast.success({ detail: 'Interview rescheduled.' });
            this.closeRescheduleDialog();
            this.loadInterview();
          }
        },
        error: (error) => {
          this.rescheduleSaving = false;
          this.toast.error({ detail: error?.error?.decentMessage || 'Failed to reschedule interview.' });
        },
      });
  }

  // ── Cancel ─────────────────────────────────────────────────────

  openCancelDialog(): void {
    this.cancelReason = '';
    this.cancelDialogVisible = true;
  }

  closeCancelDialog(): void {
    this.cancelDialogVisible = false;
    this.cancelReason = '';
  }

  get canSaveCancel(): boolean {
    return !!this.cancelReason.trim() && !this.cancelSaving;
  }

  saveCancel(): void {
    if (!this.cancelReason.trim()) return;

    this.cancelSaving = true;
    this.interviewService.cancel(this.interviewId, { cancellationReason: this.cancelReason.trim() }).subscribe({
      next: (response) => {
        this.cancelSaving = false;
        if (response.hasError) {
          this.toast.error({ detail: response?.decentMessage || 'Failed to cancel interview.' });
        } else {
          this.toast.success({ detail: 'Interview cancelled.' });
          this.closeCancelDialog();
          this.loadInterview();
        }
      },
      error: (error) => {
        this.cancelSaving = false;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to cancel interview.' });
      },
    });
  }

  // ── Mark Result ──────────────────────────────────────────────────

  openMarkResultDialog(): void {
    this.markResultValue = null;
    this.markResultDialogVisible = true;
  }

  closeMarkResultDialog(): void {
    this.markResultDialogVisible = false;
    this.markResultValue = null;
  }

  get canSaveMarkResult(): boolean {
    return !!this.markResultValue && !this.markResultSaving;
  }

  saveMarkResult(): void {
    if (!this.markResultValue) return;

    this.markResultSaving = true;
    this.interviewService.markResult(this.interviewId, { result: this.markResultValue }).subscribe({
      next: (response) => {
        this.markResultSaving = false;
        if (response.hasError) {
          this.toast.error({ detail: response?.decentMessage || 'Failed to mark interview result.' });
        } else {
          this.toast.success({ detail: 'Interview result recorded.' });
          this.closeMarkResultDialog();
          this.loadInterview();
        }
      },
      error: (error) => {
        this.markResultSaving = false;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to mark interview result.' });
      },
    });
  }
}
