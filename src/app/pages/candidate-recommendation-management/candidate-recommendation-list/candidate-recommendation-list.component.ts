import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RecommendationStatusEnum } from '@app/@core/enums/recruitment.enum';
import { ICandidateRecommendationPendingListItem } from '@app/@core/interfaces/recruitment-management/candidate-recommendation.interface';
import { CandidateRecommendationService } from '@app/@core/services/recruitment/candidate-recommendation/candidate-recommendation.service';
import { ToastService } from '@app/@core/services/misc/toast.service';

@Component({
  selector: 'app-candidate-recommendation-list',
  standalone: false,
  templateUrl: './candidate-recommendation-list.component.html',
  styleUrl: './candidate-recommendation-list.component.scss',
})
export class CandidateRecommendationListComponent implements OnInit {
  constructor(
    private candidateRecommendationService: CandidateRecommendationService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  pending: ICandidateRecommendationPendingListItem[] = [];
  loading = false;

  reviewDialogVisible = false;
  reviewingId: number | null = null;
  reviewingStatus: RecommendationStatusEnum | null = null;
  reviewComments = '';
  reviewing = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.candidateRecommendationService.getPending().subscribe({
      next: (response) => {
        this.pending = response && !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.pending = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openReview(item: ICandidateRecommendationPendingListItem, status: RecommendationStatusEnum): void {
    this.reviewingId = item.candidateRecommendationId;
    this.reviewingStatus = status;
    this.reviewComments = '';
    this.reviewDialogVisible = true;
  }

  openAccept(item: ICandidateRecommendationPendingListItem): void {
    this.openReview(item, RecommendationStatusEnum.Accepted);
  }

  openReject(item: ICandidateRecommendationPendingListItem): void {
    this.openReview(item, RecommendationStatusEnum.Rejected);
  }

  cancelReview(): void {
    this.reviewDialogVisible = false;
    this.reviewingId = null;
    this.reviewingStatus = null;
    this.reviewComments = '';
  }

  confirmReview(): void {
    if (!this.reviewingId || !this.reviewingStatus) return;

    this.reviewing = true;
    this.candidateRecommendationService
      .review(this.reviewingId, { status: this.reviewingStatus, reviewComments: this.reviewComments || undefined })
      .subscribe({
        next: () => {
          this.reviewing = false;
          this.toast.success({ detail: `Recommendation ${this.reviewingStatus === RecommendationStatusEnum.Accepted ? 'accepted' : 'rejected'}.` });
          this.cancelReview();
          this.load();
        },
        error: (error) => {
          this.reviewing = false;
          this.toast.error({ detail: error?.error?.decentMessage || 'Failed to review recommendation.' });
        },
      });
  }
}
