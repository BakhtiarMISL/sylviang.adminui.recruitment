import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ITalentPoolResponse } from '@app/@core/interfaces/recruitment-management/talent-pool.interface';
import { TalentPoolService } from '@app/@core/services/recruitment/talent-pool/talent-pool.service';
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
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  pools: ITalentPoolResponse[] = [];
  loading = false;

  showCreateDialog = false;
  newPoolName = '';
  creating = false;
  createError = '';

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.loadPools();
  }

  loadPools(): void {
    this.loading = true;
    this.talentPoolService.getAll().subscribe({
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

  openCreateDialog(): void {
    this.newPoolName = '';
    this.createError = '';
    this.showCreateDialog = true;
  }

  createPool(): void {
    if (!this.newPoolName.trim()) return;

    this.creating = true;
    this.createError = '';

    this.talentPoolService.create({ name: this.newPoolName.trim() }).subscribe({
      next: (response) => {
        this.creating = false;
        if (!response.hasError) {
          this.showCreateDialog = false;
          this.loadPools();
        } else {
          this.createError = response.decentMessage || 'Failed to create talent pool.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.creating = false;
        this.createError = error?.error?.decentMessage || 'Failed to create talent pool.';
        this.cdr.detectChanges();
      },
    });
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
