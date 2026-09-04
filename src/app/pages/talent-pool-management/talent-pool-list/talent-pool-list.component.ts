import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IJobVacancyResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy.interface';
import { ITalentPoolResponse } from '@app/@core/interfaces/recruitment-management/talent-pool.interface';
import { JobVacancyService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy.service';
import { TalentPoolService } from '@app/@core/services/recruitment/talent-pool/talent-pool.service';
import { BreadcrumbService } from '@app/@core/services';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-talent-pool-list',
  standalone: false,
  templateUrl: './talent-pool-list.component.html',
  styleUrl: './talent-pool-list.component.scss',
})
export class TalentPoolListComponent implements OnInit {
  constructor(
    private talentPoolService: TalentPoolService,
    private jobVacancyService: JobVacancyService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private breadcrumbService: BreadcrumbService,
  ) {}

  pools: ITalentPoolResponse[] = [];
  jobVacancies: IJobVacancyResponse[] = [];
  loading = false;

  selectedJobPostingFilter: number | null = null;

  showCreateDialog = false;
  editingPool: ITalentPoolResponse | null = null;
  newPoolName = '';
  newPoolJobPostingId: number | null = null;
  creating = false;
  createError = '';

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.loadJobVacancies();
    this.loadPools();
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([{ title: 'Talent Pools', icon: 'fa-solid fa-users', href: '/talent-pools/talent-pool-list' }]);
  }

  loadJobVacancies(): void {
    this.jobVacancyService.getAllJobVacancies().subscribe({
      next: (response) => {
        this.jobVacancies = !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.jobVacancies = [];
        this.cdr.detectChanges();
      },
    });
  }

  loadPools(): void {
    this.loading = true;
    this.talentPoolService.getAll(this.selectedJobPostingFilter ?? undefined).subscribe({
      next: (response) => {
        this.pools = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.pools = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onFilterChange(): void {
    this.loadPools();
  }

  openCreateDialog(): void {
    this.editingPool = null;
    this.newPoolName = '';
    this.newPoolJobPostingId = null;
    this.createError = '';
    this.showCreateDialog = true;
  }

  openEditDialog(pool: ITalentPoolResponse): void {
    this.editingPool = pool;
    this.newPoolName = pool.name;
    this.newPoolJobPostingId = pool.jobPostingId ?? null;
    this.createError = '';
    this.showCreateDialog = true;
  }

  savePool(): void {
    if (!this.newPoolName.trim()) return;

    this.creating = true;
    this.createError = '';

    const request = { name: this.newPoolName.trim(), jobPostingId: this.newPoolJobPostingId };

    const onSuccess = (response: { hasError: boolean; decentMessage?: string | null }) => {
      this.creating = false;
      if (!response.hasError) {
        this.showCreateDialog = false;
        this.loadPools();
      } else {
        this.createError = response.decentMessage || 'Failed to save talent pool.';
      }
      this.cdr.detectChanges();
    };

    const onError = (error: any) => {
      this.creating = false;
      this.createError = error?.error?.decentMessage || 'Failed to save talent pool.';
      this.cdr.detectChanges();
    };

    if (this.editingPool) {
      this.talentPoolService.update(this.editingPool.talentPoolId, request).subscribe({ next: onSuccess, error: onError });
    } else {
      this.talentPoolService.create(request).subscribe({ next: onSuccess, error: onError });
    }
  }

  deletePool(pool: ITalentPoolResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete pool: ${pool.name}? Candidates themselves are not affected.`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.talentPoolService.delete(pool.talentPoolId).subscribe({
          next: () => {
            this.loadPools();
          },
          error: (error) => {
            console.error('Error deleting talent pool:', error);
          },
        });
      },
    });
  }
}
