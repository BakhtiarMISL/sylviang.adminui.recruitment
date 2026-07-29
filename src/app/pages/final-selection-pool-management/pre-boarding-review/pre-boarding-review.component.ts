import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';
import { PreBoardingSubmissionStatusEnum } from '@core/enums/recruitment.enum';
import { IPreBoardingSubmissionResponse } from '@core/interfaces/recruitment-management/pre-boarding.interface';
import { PreBoardingService } from '@core/services/recruitment/pre-boarding/pre-boarding.service';

// EP-12 US-096: HR reviews a candidate's submitted pre-boarding data alongside the F1 fields,
// then either validates+locks it (Approved) or requests corrections (NeedsCorrection, which
// re-opens the candidate's form the same as Draft - see PreBoardingService.EnsureNotLocked).
@Component({
  selector: 'app-pre-boarding-review',
  standalone: false,
  templateUrl: './pre-boarding-review.component.html',
  styleUrl: './pre-boarding-review.component.scss',
})
export class PreBoardingReviewComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private preBoardingService: PreBoardingService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  readonly StatusEnum = PreBoardingSubmissionStatusEnum;

  finalSelectionPoolId!: number;
  item: IPreBoardingSubmissionResponse | null = null;
  loading = false;
  loadError = '';
  actionError = '';
  validating = false;

  correctionDialogVisible = false;
  correctionComment = '';
  requestingCorrection = false;

  get canValidate(): boolean {
    return this.item?.status === PreBoardingSubmissionStatusEnum.Submitted;
  }

  get canRequestCorrection(): boolean {
    return (
      this.item?.status === PreBoardingSubmissionStatusEnum.Submitted ||
      this.item?.status === PreBoardingSubmissionStatusEnum.Approved
    );
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Final Selection Pool', icon: 'fa-solid fa-clipboard-check', href: '/final-selection-pool/final-selection-pool-list' },
      { title: 'Pre-Boarding Review', icon: 'fa-solid fa-clipboard-check', href: '' },
    ]);

    this.finalSelectionPoolId = Number(this.route.snapshot.paramMap.get('finalSelectionPoolId'));
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.loadError = '';
    this.preBoardingService.getByPool(this.finalSelectionPoolId).subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.hasError && response.content) {
          this.item = response.content;
        } else {
          this.loadError = response.decentMessage || 'Failed to load pre-boarding submission.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.loadError = error?.error?.decentMessage || 'Failed to load pre-boarding submission.';
        this.cdr.detectChanges();
      },
    });
  }

  validate(): void {
    if (!this.item || !this.canValidate) return;

    this.validating = true;
    this.actionError = '';
    this.preBoardingService.validate(this.item.preBoardingSubmissionId).subscribe({
      next: (response) => {
        this.validating = false;
        if (!response.hasError && response.content) {
          this.item = response.content;
        } else {
          this.actionError = response.decentMessage || 'Failed to validate submission.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.validating = false;
        this.actionError = error?.error?.decentMessage || 'Failed to validate submission.';
        this.cdr.detectChanges();
      },
    });
  }

  openCorrectionDialog(): void {
    this.correctionComment = '';
    this.actionError = '';
    this.correctionDialogVisible = true;
  }

  requestCorrection(): void {
    if (!this.item || !this.correctionComment.trim()) return;

    this.requestingCorrection = true;
    this.preBoardingService.requestCorrection(this.item.preBoardingSubmissionId, { comment: this.correctionComment.trim() }).subscribe({
      next: (response) => {
        this.requestingCorrection = false;
        if (!response.hasError && response.content) {
          this.item = response.content;
          this.correctionDialogVisible = false;
        } else {
          this.actionError = response.decentMessage || 'Failed to request corrections.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.requestingCorrection = false;
        this.actionError = error?.error?.decentMessage || 'Failed to request corrections.';
        this.cdr.detectChanges();
      },
    });
  }
}
