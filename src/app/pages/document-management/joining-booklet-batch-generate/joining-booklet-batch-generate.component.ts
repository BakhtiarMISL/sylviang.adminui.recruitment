import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';
import { DocumentTypeEnum } from '@app/@core/enums/recruitment.enum';
import { DocumentTemplateService } from '@app/@core/services/recruitment/document-template/document-template.service';
import { JoiningBookletService } from '@app/@core/services/recruitment/joining-booklet/joining-booklet.service';
import { FinalSelectionPoolService } from '@core/services/recruitment/final-selection-pool/final-selection-pool.service';
import { saveFileResponse } from '@app/@core/services/recruitment/cv-bank/cv-bank.service';
import {
  IJoiningBookletBulkGenerateResponse,
  IJoiningBookletEligibleCandidateResponse,
} from '@core/interfaces/recruitment-management/joining-booklet.interface';
import { IDocumentTemplateResponse } from '@core/interfaces/recruitment-management/document-template.interface';
import { IFinalSelectionPoolResponse } from '@core/interfaces/recruitment-management/final-selection-pool.interface';
import { DateTimeUtility } from '@app/@core/utils/date-time.utility';

interface BatchOption {
  label: string;
  joiningDate: string;
  offerLetterIds: number[];
}

@Component({
  selector: 'app-joining-booklet-batch-generate',
  standalone: false,
  templateUrl: './joining-booklet-batch-generate.component.html',
  styleUrl: './joining-booklet-batch-generate.component.scss',
})
export class JoiningBookletBatchGenerateComponent implements OnInit {
  constructor(
    private documentTemplateService: DocumentTemplateService,
    private joiningBookletService: JoiningBookletService,
    private finalSelectionPoolService: FinalSelectionPoolService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {}

  loading = false;
  generating = false;
  downloading = false;
  formSubmitted = false;
  statusMessage = '';
  statusIsError = false;

  selectedBatch: BatchOption | null = null;
  joiningDate: Date | null = null;
  documentTemplateId: number | null = null;

  templateOptions: { label: string; value: number }[] = [];
  batchOptions: BatchOption[] = [];
  private allEligibleCandidates: IJoiningBookletEligibleCandidateResponse[] = [];
  eligibleCandidates: IJoiningBookletEligibleCandidateResponse[] = [];
  selectedCandidates: IJoiningBookletEligibleCandidateResponse[] = [];

  lastGenerateResponse: IJoiningBookletBulkGenerateResponse | null = null;

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'System Administration', icon: 'fa-solid fa-gears', href: '/document-management/offer-letter-list' },
      { title: 'Joining Booklets', icon: 'fa-solid fa-book', href: '/document-management/joining-booklet-list' },
      { title: 'Generate Batch', icon: 'fa-solid fa-plus', href: '' },
    ]);

    this.loadTemplates();
    this.loadEligibleCandidates();
    this.loadBatches();
  }

  private loadTemplates(): void {
    this.documentTemplateService.getAll().subscribe({
      next: (response) => {
        const templates: IDocumentTemplateResponse[] = !response.hasError && response.content ? response.content : [];
        this.templateOptions = templates
          .filter((t) => t.documentType === DocumentTypeEnum.JoiningBooklet && t.isActive)
          .map((t) => ({ label: t.name, value: t.documentTemplateId }));
      },
    });
  }

  private loadEligibleCandidates(): void {
    this.loading = true;
    this.joiningBookletService.getEligibleCandidates().subscribe({
      next: (response) => {
        this.allEligibleCandidates = !response.hasError && response.content ? response.content : [];
        this.applyBatchCandidates();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.allEligibleCandidates = [];
        this.applyBatchCandidates();
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadBatches(): void {
    this.finalSelectionPoolService.getAll().subscribe({
      next: (response) => {
        const poolItems: IFinalSelectionPoolResponse[] = !response.hasError && response.content ? response.content : [];
        const batches = new Map<string, BatchOption>();

        poolItems
          .filter((item) => !!item.batchLabel?.trim())
          .forEach((item) => {
            const label = item.batchLabel!.trim();
            const existing = batches.get(label);
            if (existing) {
              existing.offerLetterIds.push(item.offerLetterId);
            } else {
              batches.set(label, { label, joiningDate: item.joiningDate, offerLetterIds: [item.offerLetterId] });
            }
          });

        this.batchOptions = [...batches.values()].sort((a, b) => a.label.localeCompare(b.label));
        this.cdr.detectChanges();
      },
      error: () => {
        this.batchOptions = [];
        this.cdr.detectChanges();
      },
    });
  }

  onBatchChange(): void {
    this.formSubmitted = false;
    this.statusMessage = '';
    this.lastGenerateResponse = null;
    this.selectedCandidates = [];
    this.joiningDate = this.selectedBatch ? this.parseLocalDate(this.selectedBatch.joiningDate) : null;
    this.applyBatchCandidates();
  }

  private applyBatchCandidates(): void {
    if (!this.selectedBatch) {
      this.eligibleCandidates = [];
      return;
    }

    const offerLetterIds = new Set(this.selectedBatch.offerLetterIds);
    this.eligibleCandidates = this.allEligibleCandidates.filter((candidate) => offerLetterIds.has(candidate.offerLetterId));
  }

  private parseLocalDate(value: string): Date {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  get batchLabel(): string {
    return this.selectedBatch?.label ?? '';
  }

  generateBatch(): void {
    this.formSubmitted = true;
    this.statusMessage = '';

    if (!this.selectedBatch || !this.joiningDate || !this.documentTemplateId || this.selectedCandidates.length === 0) {
      return;
    }

    this.generating = true;
    this.lastGenerateResponse = null;
    this.joiningBookletService
      .bulkGenerate({
        offerLetterIds: this.selectedCandidates.map((c) => c.offerLetterId),
        documentTemplateId: this.documentTemplateId,
        batchLabel: this.batchLabel.trim(),
        // .toISOString() shifts to UTC (the exact anti-pattern the Exam/Interview timezone fix
        // replaced everywhere else) - a local-midnight joining date turns into an 18:00-the-day-
        // before UTC stamp on the generated booklet.
        joiningDate: DateTimeUtility.toLocalDateTimeString(this.joiningDate)!,
      })
      .subscribe({
        next: (response) => {
          this.generating = false;
          if (!response.hasError && response.content) {
            this.lastGenerateResponse = response.content;
            this.statusIsError = response.content.failureCount > 0;
            this.statusMessage = `Generated ${response.content.successCount} of ${response.content.totalRequested} joining booklet(s).`;
          } else {
            this.statusIsError = true;
            this.statusMessage = response.decentMessage || 'Failed to generate joining booklets.';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.generating = false;
          this.statusIsError = true;
          this.statusMessage = error?.error?.decentMessage || 'Failed to generate joining booklets.';
          this.cdr.detectChanges();
        },
      });
  }

  downloadZip(): void {
    const successfulIds = (this.lastGenerateResponse?.results || [])
      .filter((r) => r.success && r.joiningBookletId)
      .map((r) => r.joiningBookletId as number);
    if (successfulIds.length === 0) return;

    this.downloading = true;
    this.joiningBookletService.bulkDownload({ joiningBookletIds: successfulIds }).subscribe({
      next: (response) => {
        saveFileResponse(response, `Joining-Booklets-${this.batchLabel || 'batch'}.zip`);
        this.downloading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.statusIsError = true;
        this.statusMessage = 'Failed to download joining booklets.';
        this.downloading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get skeletonItems() {
    return Array(4)
      .fill({})
      .map((_, index) => ({ id: index }));
  }
}
