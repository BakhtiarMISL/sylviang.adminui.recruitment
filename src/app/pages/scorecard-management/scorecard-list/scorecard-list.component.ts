import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IScorecardResponse } from '@app/@core/interfaces/recruitment-management/scorecard.interface';
import { ScorecardService } from '@app/@core/services/recruitment/scorecard/scorecard.service';
import { BreadcrumbService } from '@app/@core/services';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-scorecard-list',
  standalone: false,
  templateUrl: './scorecard-list.component.html',
  styleUrl: './scorecard-list.component.scss',
})
export class ScorecardListComponent implements OnInit {
  constructor(
    private scorecardService: ScorecardService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  scorecards: IScorecardResponse[] = [];
  loading = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/scorecards/scorecard-list' },
      { title: 'Scorecard Templates', icon: 'fa-solid fa-clipboard-list', href: '/scorecards/scorecard-list' },
    ]);
    this.loadScorecards();
  }

  totalWeight(scorecard: IScorecardResponse): number {
    return scorecard.criteria.reduce((sum, c) => sum + c.weight, 0);
  }

  loadScorecards(): void {
    this.loading = true;
    this.scorecardService.getAll().subscribe({
      next: (response) => {
        this.scorecards = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.scorecards = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  editScorecard(scorecard: IScorecardResponse): void {
    this.router.navigate(['/scorecards/manage-scorecard', scorecard.scorecardId]);
  }

  toggleActiveStatus(scorecard: IScorecardResponse, event: Event): void {
    const nextStatus = !scorecard.isActive;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to ${nextStatus ? 'activate' : 'deactivate'} scorecard: ${scorecard.name}?`,
      header: nextStatus ? 'Activate Confirmation' : 'Deactivate Confirmation',
      acceptButtonStyleClass: nextStatus ? 'p-button-success' : 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.scorecardService.setActiveStatus(scorecard.scorecardId, { isActive: nextStatus }).subscribe({
          next: () => this.loadScorecards(),
          error: (error) => {
            console.error('Error updating scorecard status:', error);
          },
        });
      },
    });
  }
}
