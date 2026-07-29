import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IFinalSelectionPoolResponse } from '@core/interfaces/recruitment-management/final-selection-pool.interface';
import { FinalSelectionPoolService } from '@core/services/recruitment/final-selection-pool/final-selection-pool.service';
import { DateTimeUtility } from '@app/@core/utils/date-time.utility';

@Component({
  selector: 'app-final-selection-pool-list',
  standalone: false,
  templateUrl: './final-selection-pool-list.component.html',
  styleUrl: './final-selection-pool-list.component.scss',
})
export class FinalSelectionPoolListComponent implements OnInit {
  constructor(
    private finalSelectionPoolService: FinalSelectionPoolService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: IFinalSelectionPoolResponse[] = [];
  loading = false;
  errorMessage = '';

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  editingItem: IFinalSelectionPoolResponse | null = null;
  editBatchLabel = '';
  editJoiningDate: Date | null = null;
  editDialogVisible = false;
  saving = false;
  saveError = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.finalSelectionPoolService.getAll().subscribe({
      next: (response) => {
        this.items = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.decentMessage || 'Failed to load final selection pool.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openEditDialog(item: IFinalSelectionPoolResponse): void {
    this.editingItem = item;
    this.editBatchLabel = item.batchLabel || '';
    this.editJoiningDate = item.joiningDate ? new Date(item.joiningDate) : null;
    this.saveError = '';
    this.editDialogVisible = true;
  }

  saveBatch(): void {
    if (!this.editingItem || !this.editJoiningDate) return;

    this.saving = true;
    this.saveError = '';
    this.finalSelectionPoolService
      .updateBatch(this.editingItem.finalSelectionPoolId, {
        batchLabel: this.editBatchLabel.trim() || null,
        joiningDate: DateTimeUtility.formatDateForAPI(this.editJoiningDate),
      })
      .subscribe({
        next: (response) => {
          this.saving = false;
          if (!response.hasError) {
            this.editDialogVisible = false;
            this.load();
          } else {
            this.saveError = response.decentMessage || 'Failed to update batch.';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.saving = false;
          this.saveError = error?.error?.decentMessage || 'Failed to update batch.';
          this.cdr.detectChanges();
        },
      });
  }

  markJoined(item: IFinalSelectionPoolResponse): void {
    this.finalSelectionPoolService.markHasJoined(item.finalSelectionPoolId).subscribe({
      next: () => this.load(),
      error: (error) => {
        this.errorMessage = error?.error?.decentMessage || 'Failed to mark candidate as joined.';
        this.cdr.detectChanges();
      },
    });
  }
}
