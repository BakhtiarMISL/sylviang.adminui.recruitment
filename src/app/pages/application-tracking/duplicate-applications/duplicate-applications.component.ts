import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IJobApplicationDuplicateGroup } from '@app/@core/interfaces/recruitment-management/job-application.interface';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { BreadcrumbService } from '@app/@core/services';
import { ConfirmationService } from 'primeng/api';

/** One row's worth of UI state for a detected duplicate group (US-038 AC2/AC3). */
interface DuplicateGroupRow {
  group: IJobApplicationDuplicateGroup;
  primaryId: number | null;
}

@Component({
  selector: 'app-duplicate-applications',
  standalone: false,
  templateUrl: './duplicate-applications.component.html',
  styleUrl: './duplicate-applications.component.scss',
})
export class DuplicateApplicationsComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobApplicationService: JobApplicationService,
    private toast: ToastService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private breadcrumbService: BreadcrumbService,
  ) {}

  jobPostingId!: number;
  jobPostingTitle = '';
  rows: DuplicateGroupRow[] = [];
  loading = true;
  resolvingIndex: number | null = null;

  private routeSub: Subscription | null = null;

  ngOnInit(): void {
    // Subscribed, not a one-time snapshot read - RouteReusableStrategy reuses this component
    // instance across navigations to a different jobPostingId, so a snapshot read left the page
    // showing the previous vacancy's duplicate groups.
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.jobPostingId = Number(params.get('jobPostingId'));
      this.jobPostingTitle = this.route.snapshot.queryParamMap.get('title') || `#${this.jobPostingId}`;

      this.breadcrumbService.setBreadcrumbs([
        { title: 'ATS Dashboard', icon: 'fa-solid fa-list-check', href: '/applications' },
        { title: 'Duplicates', icon: 'fa-solid fa-clone', href: `/applications/duplicates/${this.jobPostingId}` },
      ]);

      this.load();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.jobApplicationService.getDuplicates(this.jobPostingId).subscribe({
      next: (response) => {
        const groups = response && !response.hasError && response.content ? response.content : [];
        this.rows = groups.map((group) => ({ group, primaryId: group.applications[0]?.jobApplicationId ?? null }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.toast.error({ detail: 'Failed to load duplicate applications.' });
      },
    });
  }

  backToDashboard(): void {
    this.router.navigate(['/applications']);
  }

  resolve(row: DuplicateGroupRow, index: number, event: Event): void {
    if (!row.primaryId) return;
    const duplicateIds = row.group.applications.map((a) => a.jobApplicationId).filter((id) => id !== row.primaryId);
    if (duplicateIds.length === 0) return;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Keep the selected application as primary and mark the other ${duplicateIds.length} as "Duplicate Dismissed"?`,
      header: 'Resolve Duplicate Applications',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.resolvingIndex = index;
        this.jobApplicationService
          .resolveDuplicates({
            jobPostingId: this.jobPostingId,
            primaryJobApplicationId: row.primaryId!,
            duplicateJobApplicationIds: duplicateIds,
          })
          .subscribe({
            next: () => {
              this.resolvingIndex = null;
              this.toast.success({ detail: 'Duplicate applications resolved.' });
              this.rows = this.rows.filter((_, i) => i !== index);
              this.cdr.detectChanges();
            },
            error: (error) => {
              this.resolvingIndex = null;
              this.toast.error({ detail: error?.error?.decentMessage || 'Failed to resolve duplicates.' });
            },
          });
      },
    });
  }
}
