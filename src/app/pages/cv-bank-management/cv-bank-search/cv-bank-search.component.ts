import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApplicationSourceEnum, EducationLevelEnum } from '@app/@core/enums/recruitment.enum';
import { ICvBankSearchResultResponse } from '@app/@core/interfaces/recruitment-management/cv-bank.interface';
import { CvBankService, saveFileResponse } from '@app/@core/services/recruitment/cv-bank/cv-bank.service';
import { UI_CONFIG } from '@app/@core/constants';
import { Base_URL } from '@env/environment';

@Component({
  selector: 'app-cv-bank-search',
  standalone: false,
  templateUrl: './cv-bank-search.component.html',
  styleUrl: './cv-bank-search.component.scss',
})
export class CvBankSearchComponent implements OnInit {
  constructor(
    private cvBankService: CvBankService,
    private cdr: ChangeDetectorRef,
  ) {}

  UI_CONFIG = UI_CONFIG;
  educationLevelOptions = Object.values(EducationLevelEnum).map((value) => ({ label: value, value }));
  candidateTypeOptions = Object.values(ApplicationSourceEnum).map((value) => ({ label: value, value }));

  booleanQuery = '';
  educationLevel: EducationLevelEnum | null = null;
  minExperienceYears: number | null = null;
  maxExperienceYears: number | null = null;
  location = '';
  candidateType: ApplicationSourceEnum | null = null;

  results: ICvBankSearchResultResponse[] = [];
  selectedResults: ICvBankSearchResultResponse[] = [];
  totalRecords = 0;
  loading = false;
  hasSearched = false;
  rows = UI_CONFIG.defaultPageSize;
  currentPage = 1;
  statusMessage = '';
  statusIsError = false;
  filtersCollapsed = true;
  downloadingCandidateId: number | null = null;
  bulkDownloading = false;
  bulkExporting = false;

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.currentPage = 1;
    this.filtersCollapsed = true;
    this.loadResults();
  }

  resetFilters(): void {
    this.booleanQuery = '';
    this.educationLevel = null;
    this.minExperienceYears = null;
    this.maxExperienceYears = null;
    this.location = '';
    this.candidateType = null;
    this.filtersCollapsed = false;
    this.search();
  }

  loadResults(): void {
    this.loading = true;
    this.statusMessage = '';

    this.cvBankService
      .search({
        booleanQuery: this.booleanQuery.trim() || undefined,
        educationLevel: this.educationLevel ?? undefined,
        minExperienceYears: this.minExperienceYears ?? undefined,
        maxExperienceYears: this.maxExperienceYears ?? undefined,
        location: this.location.trim() || undefined,
        candidateType: this.candidateType ?? undefined,
        page: this.currentPage,
        pageSize: this.rows,
      })
      .subscribe({
        next: (response) => {
          this.hasSearched = true;
          if (!response.hasError && response.content) {
            this.results = response.content.data || [];
            this.totalRecords = response.content.totalCount || 0;
          } else {
            this.results = [];
            this.totalRecords = 0;
            this.statusMessage = response.decentMessage || 'Search failed.';
            this.statusIsError = true;
          }
          this.selectedResults = [];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.hasSearched = true;
          this.results = [];
          this.totalRecords = 0;
          this.selectedResults = [];
          this.loading = false;
          this.statusMessage = 'Search failed. The query may be malformed - check your AND/OR/NOT syntax.';
          this.statusIsError = true;
          this.cdr.detectChanges();
        },
      });
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadResults();
  }

  getPhotoUrl(candidate: ICvBankSearchResultResponse): string {
    if (!candidate.profilePhotoPath) return '';
    return `${Base_URL}${candidate.profilePhotoPath.startsWith('/') ? '' : '/'}${candidate.profilePhotoPath}`;
  }

  addSelectedToTalentPool(): void {
    if (this.selectedResults.length === 0) return;

    this.cvBankService
      .addToTalentPool({ candidateProfileIds: this.selectedResults.map((r) => r.candidateProfileId) })
      .subscribe({
        next: (response) => {
          if (!response.hasError && response.content) {
            const { addedCount, alreadyInPoolCount } = response.content;
            this.statusIsError = false;
            this.statusMessage =
              alreadyInPoolCount > 0
                ? `Added ${addedCount} candidate(s) to the talent pool (${alreadyInPoolCount} were already in it).`
                : `Added ${addedCount} candidate(s) to the talent pool.`;
            this.selectedResults = [];
          } else {
            this.statusIsError = true;
            this.statusMessage = response.decentMessage || 'Failed to add to talent pool.';
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.statusIsError = true;
          this.statusMessage = 'Failed to add to talent pool.';
          this.cdr.detectChanges();
        },
      });
  }

  downloadCv(candidate: ICvBankSearchResultResponse): void {
    this.downloadingCandidateId = candidate.candidateProfileId;
    this.cvBankService.downloadCv(candidate.candidateProfileId).subscribe({
      next: (response) => {
        saveFileResponse(response, `${candidate.fullName}_CV.pdf`);
        this.downloadingCandidateId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.statusIsError = true;
        this.statusMessage = 'Failed to download CV.';
        this.downloadingCandidateId = null;
        this.cdr.detectChanges();
      },
    });
  }

  downloadSelectedCvs(): void {
    if (this.selectedResults.length === 0) return;

    this.bulkDownloading = true;
    const candidateProfileIds = this.selectedResults.map((r) => r.candidateProfileId);
    this.cvBankService.bulkDownloadCv({ candidateProfileIds }).subscribe({
      next: (response) => {
        saveFileResponse(response, 'CV-Bank-Export.zip');
        this.bulkDownloading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.statusIsError = true;
        this.statusMessage = 'Failed to download CVs.';
        this.bulkDownloading = false;
        this.cdr.detectChanges();
      },
    });
  }

  exportSelectedToExcel(): void {
    if (this.selectedResults.length === 0) return;

    this.bulkExporting = true;
    const candidateProfileIds = this.selectedResults.map((r) => r.candidateProfileId);
    this.cvBankService.bulkExportExcel({ candidateProfileIds }).subscribe({
      next: (response) => {
        saveFileResponse(response, 'CV-Bank-Export.xlsx');
        this.bulkExporting = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.statusIsError = true;
        this.statusMessage = 'Failed to export to Excel.';
        this.bulkExporting = false;
        this.cdr.detectChanges();
      },
    });
  }
}
