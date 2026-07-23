import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { HrOverrideDecisionEnum } from '@app/@core/enums/recruitment.enum';
import { IAutoShortlistApplyResponse, IAutoShortlistResult, IAutoShortlistRun } from '@app/@core/interfaces/recruitment-management/auto-shortlist.interface';
import { AutoShortlistService } from '@app/@core/services/recruitment/auto-shortlist/auto-shortlist.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { ConfirmationService } from 'primeng/api';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const DEFAULT_CUTOFF_SCORE = 70;

@Component({
  selector: 'app-auto-shortlist-dialog',
  standalone: false,
  templateUrl: './auto-shortlist-dialog.component.html',
  styleUrl: './auto-shortlist-dialog.component.scss',
})
export class AutoShortlistDialogComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private autoShortlistService: AutoShortlistService,
    private confirmationService: ConfirmationService,
    private toast: ToastService,
  ) {}

  @Input() jobPostingId!: number;
  @Output() applied = new EventEmitter<void>();

  run: IAutoShortlistRun | null = null;
  loading = true;
  running = false;
  applying = false;

  cutoffScore = DEFAULT_CUTOFF_SCORE;
  private cutoffChange$ = new Subject<number>();

  applySummary: IAutoShortlistApplyResponse | null = null;
  applySummaryVisible = false;

  HrOverrideDecisionEnum = HrOverrideDecisionEnum;

  ngOnInit(): void {
    this.cutoffChange$.pipe(debounceTime(500)).subscribe((score) => this.adjustCutoff(score));
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jobPostingId'] && !changes['jobPostingId'].firstChange) {
      this.load();
    }
  }

  ngOnDestroy(): void {
    this.cutoffChange$.complete();
  }

  load(): void {
    if (!this.jobPostingId) return;

    this.loading = true;
    this.autoShortlistService.getLatest(this.jobPostingId).subscribe({
      next: (response) => {
        this.loading = false;
        this.run = response && !response.hasError ? response.content : null;
        this.cutoffScore = this.run?.cutoffScore ?? DEFAULT_CUTOFF_SCORE;
      },
      error: () => {
        this.loading = false;
        this.run = null;
      },
    });
  }

  runShortlisting(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.run
        ? 'Re-run AI shortlisting? This creates a fresh ranked list and does not affect already-applied statuses.'
        : 'Score every application for this vacancy against the job posting?',
      header: 'Run AI Shortlisting',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.running = true;
        this.autoShortlistService.run({ jobPostingId: this.jobPostingId, cutoffScore: this.cutoffScore }).subscribe({
          next: (response) => {
            this.running = false;
            this.run = response && !response.hasError ? response.content : null;
            this.toast.success({ detail: 'Shortlisting run complete.' });
          },
          error: (error) => {
            this.running = false;
            this.toast.error({ detail: error?.error?.decentMessage || 'Failed to run shortlisting.' });
          },
        });
      },
    });
  }

  onCutoffChange(): void {
    if (!this.run) return;
    this.cutoffChange$.next(this.cutoffScore);
  }

  private adjustCutoff(cutoffScore: number): void {
    if (!this.run) return;

    this.autoShortlistService.adjustCutoff(this.run.autoShortlistRunId, { cutoffScore }).subscribe({
      next: (response) => {
        if (response && !response.hasError) {
          this.run = response.content;
        }
      },
      error: (error) => {
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to adjust cutoff.' });
      },
    });
  }

  overrideRow(result: IAutoShortlistResult, decision: HrOverrideDecisionEnum | null): void {
    this.autoShortlistService.override(result.autoShortlistResultId, { decision }).subscribe({
      next: (response) => {
        if (response && !response.hasError && this.run) {
          const updated = response.content;
          this.run = {
            ...this.run,
            results: this.run.results.map((r) => (r.autoShortlistResultId === updated.autoShortlistResultId ? updated : r)),
          };
        }
      },
      error: (error) => {
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to update decision.' });
      },
    });
  }

  get sortedResults(): IAutoShortlistResult[] {
    if (!this.run) return [];
    return [...this.run.results].sort((a, b) => Number(b.finalIncluded) - Number(a.finalIncluded));
  }

  canApply(): boolean {
    return !!this.run && this.run.results.length > 0;
  }

  applyDecisions(event: Event): void {
    if (!this.run) return;
    const includedCount = this.run.results.filter((r) => r.finalIncluded).length;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Move ${includedCount} candidate(s) to Shortlisted?`,
      header: 'Apply AI Shortlisting Decisions',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.applying = true;
        this.autoShortlistService.apply(this.run!.autoShortlistRunId).subscribe({
          next: (response) => {
            this.applying = false;
            this.applySummary = response?.content ?? null;
            this.applySummaryVisible = true;
            this.applied.emit();
          },
          error: (error) => {
            this.applying = false;
            this.toast.error({ detail: error?.error?.decentMessage || 'Failed to apply decisions.' });
          },
        });
      },
    });
  }
}
