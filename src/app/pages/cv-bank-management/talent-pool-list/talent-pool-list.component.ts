import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ICvBankTalentPoolEntryResponse } from '@app/@core/interfaces/recruitment-management/cv-bank.interface';
import { CvBankService } from '@app/@core/services/recruitment/cv-bank/cv-bank.service';
import { Base_URL } from '@env/environment';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-talent-pool-list',
  standalone: false,
  templateUrl: './talent-pool-list.component.html',
  styleUrl: './talent-pool-list.component.scss',
})
export class TalentPoolListComponent implements OnInit {
  constructor(
    private cvBankService: CvBankService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  entries: ICvBankTalentPoolEntryResponse[] = [];
  loading = false;

  get skeletonItems() {
    return Array(5)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.loadTalentPool();
  }

  loadTalentPool(): void {
    this.loading = true;
    this.cvBankService.getTalentPool().subscribe({
      next: (response) => {
        this.entries = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.entries = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getPhotoUrl(entry: ICvBankTalentPoolEntryResponse): string {
    if (!entry.profilePhotoPath) return '';
    return `${Base_URL}${entry.profilePhotoPath.startsWith('/') ? '' : '/'}${entry.profilePhotoPath}`;
  }

  remove(entry: ICvBankTalentPoolEntryResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Remove ${entry.fullName} from the talent pool?`,
      header: 'Remove Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.cvBankService.removeFromTalentPool(entry.candidateProfileId).subscribe({
          next: () => this.loadTalentPool(),
          error: (error) => {
            console.error('Error removing candidate from talent pool:', error);
          },
        });
      },
    });
  }
}
