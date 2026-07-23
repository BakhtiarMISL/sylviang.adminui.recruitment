import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamTypeEnum } from '@app/@core/enums/recruitment.enum';
import { IExamEnrollmentResponse } from '@app/@core/interfaces/recruitment-management/exam-enrollment.interface';
import { IExamResponse } from '@app/@core/interfaces/recruitment-management/exam.interface';
import { IExamRoomResponse } from '@app/@core/interfaces/recruitment-management/exam-room.interface';
import { BreadcrumbService } from '@app/@core/services';
import { ExamService } from '@app/@core/services/recruitment/exam/exam.service';
import { ExamRoomService } from '@app/@core/services/recruitment/exam-room/exam-room.service';
import { saveFileResponse } from '@app/@core/services/recruitment/cv-bank/cv-bank.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-exam-detail',
  standalone: false,
  templateUrl: './exam-detail.component.html',
  styleUrl: './exam-detail.component.scss',
})
export class ExamDetailComponent implements OnInit {
  constructor(
    private examService: ExamService,
    private examRoomService: ExamRoomService,
    private toast: ToastService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  readonly ExamTypeEnum = ExamTypeEnum;

  examId!: number;
  exam: IExamResponse | null = null;
  enrollments: IExamEnrollmentResponse[] = [];

  loadingExam = false;
  loadingEnrollments = false;
  generatingSeatPlan = false;
  downloadingSeatPlanPdf = false;
  downloadingSeatPlanExcel = false;
  downloadingAdmitCardId: number | null = null;

  // Manual "Reassign" dialog (single enrollment room/seat override)
  reassignDialogVisible = false;
  reassignEnrollment: IExamEnrollmentResponse | null = null;
  reassignExamRoomId: number | null = null;
  reassignSeatNumber = '';
  reassignRooms: IExamRoomResponse[] = [];
  reassignSaving = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (!idParam) {
        this.router.navigate(['/exams/exam-list']);
        return;
      }
      this.examId = +idParam;
      this.loadExam();
      this.loadEnrollments();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/exams/exam-list' },
      { title: 'Exams', icon: 'fa-solid fa-file-pen', href: '/exams/exam-list' },
      { title: this.exam?.title || 'Exam Detail', icon: 'fa-solid fa-circle-info', href: `/exams/exam/${this.examId}` },
    ]);
  }

  loadExam(): void {
    this.loadingExam = true;
    this.examService.getById(this.examId).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.exam = response.content;
        } else {
          this.router.navigate(['/exams/exam-list']);
        }
        this.loadingExam = false;
        this.setBreadcrumbs();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingExam = false;
        this.router.navigate(['/exams/exam-list']);
      },
    });
  }

  loadEnrollments(): void {
    this.loadingEnrollments = true;
    this.examService.getEnrollments(this.examId).subscribe({
      next: (response) => {
        this.enrollments = response && !response.hasError && response.content ? response.content : [];
        this.loadingEnrollments = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.enrollments = [];
        this.loadingEnrollments = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Seat plan generation ────────────────────────────────────────

  generateSeatPlan(event: Event): void {
    if (!this.exam) return;

    const isRegenerate = !!this.exam.seatPlanGeneratedAt;

    if (isRegenerate) {
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'This will overwrite any manual seat adjustments. Continue?',
        header: 'Regenerate Seat Plan',
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-secondary',
        acceptIcon: 'fa fa-check',
        rejectIcon: 'fa fa-times',
        accept: () => this.doGenerateSeatPlan(),
      });
    } else {
      this.doGenerateSeatPlan();
    }
  }

  private doGenerateSeatPlan(): void {
    this.generatingSeatPlan = true;
    this.examService.generateSeatPlan(this.examId).subscribe({
      next: (response) => {
        this.generatingSeatPlan = false;
        if (response.hasError) {
          this.toast.error({ detail: response?.decentMessage || 'Failed to generate seat plan.' });
        } else {
          this.toast.success({ detail: 'Seat plan generated.' });
          this.loadExam();
          this.loadEnrollments();
        }
      },
      error: (error) => {
        this.generatingSeatPlan = false;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to generate seat plan.' });
      },
    });
  }

  // ── Downloads ────────────────────────────────────────────────────

  downloadSeatPlanPdf(): void {
    this.downloadingSeatPlanPdf = true;
    this.examService.downloadSeatPlanPdf(this.examId).subscribe({
      next: (response) => {
        saveFileResponse(response, `SeatPlan-${this.examId}.pdf`);
        this.downloadingSeatPlanPdf = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.downloadingSeatPlanPdf = false;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to download seat plan PDF.' });
        this.cdr.detectChanges();
      },
    });
  }

  downloadSeatPlanExcel(): void {
    this.downloadingSeatPlanExcel = true;
    this.examService.downloadSeatPlanExcel(this.examId).subscribe({
      next: (response) => {
        saveFileResponse(response, `SeatPlan-${this.examId}.xlsx`);
        this.downloadingSeatPlanExcel = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.downloadingSeatPlanExcel = false;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to download seat plan Excel.' });
        this.cdr.detectChanges();
      },
    });
  }

  downloadAdmitCard(enrollment: IExamEnrollmentResponse): void {
    this.downloadingAdmitCardId = enrollment.examEnrollmentId;
    this.examService.downloadAdmitCard(this.examId, enrollment.examEnrollmentId).subscribe({
      next: (response) => {
        saveFileResponse(response, `AdmitCard-${enrollment.candidateName}.pdf`);
        this.downloadingAdmitCardId = null;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.downloadingAdmitCardId = null;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to download admit card.' });
        this.cdr.detectChanges();
      },
    });
  }

  // ── Manual reassign dialog ───────────────────────────────────────

  openReassignDialog(enrollment: IExamEnrollmentResponse): void {
    if (!this.exam?.examVenueId) return;

    this.reassignEnrollment = enrollment;
    this.reassignExamRoomId = enrollment.examRoomId ?? null;
    this.reassignSeatNumber = enrollment.seatNumber ?? '';
    this.reassignRooms = [];
    this.reassignDialogVisible = true;

    this.examRoomService.getAllByVenue(this.exam.examVenueId).subscribe({
      next: (response) => {
        this.reassignRooms = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  closeReassignDialog(): void {
    this.reassignDialogVisible = false;
    this.reassignEnrollment = null;
    this.reassignExamRoomId = null;
    this.reassignSeatNumber = '';
  }

  get canSaveReassign(): boolean {
    return !!this.reassignExamRoomId && !!this.reassignSeatNumber.trim() && !this.reassignSaving;
  }

  saveReassign(): void {
    if (!this.reassignEnrollment || !this.reassignExamRoomId || !this.reassignSeatNumber.trim()) return;

    this.reassignSaving = true;
    this.examService
      .reassignSeat(this.examId, this.reassignEnrollment.examEnrollmentId, this.reassignExamRoomId, this.reassignSeatNumber.trim())
      .subscribe({
        next: (response) => {
          this.reassignSaving = false;
          if (response.hasError) {
            this.toast.error({ detail: response?.decentMessage || 'Failed to reassign seat.' });
          } else {
            this.toast.success({ detail: 'Seat reassigned.' });
            this.closeReassignDialog();
            this.loadEnrollments();
          }
        },
        error: (error) => {
          this.reassignSaving = false;
          this.toast.error({ detail: error?.error?.decentMessage || 'Failed to reassign seat.' });
        },
      });
  }
}
