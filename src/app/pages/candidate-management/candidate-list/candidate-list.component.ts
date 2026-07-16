import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ICandidateProfileSummaryResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { UI_CONFIG } from '@app/@core/constants';
import { Base_URL } from '@env/environment';

@Component({
  selector: 'app-candidate-list',
  standalone: false,
  templateUrl: './candidate-list.component.html',
  styleUrl: './candidate-list.component.scss',
})
export class CandidateListComponent implements OnInit {
  constructor(
    private candidateProfileService: CandidateProfileService,
    private cdr: ChangeDetectorRef,
  ) {}

  candidates: ICandidateProfileSummaryResponse[] = [];
  isLoading = true;
  totalRecords = 0;
  loading = false;
  UI_CONFIG = UI_CONFIG;
  rows = UI_CONFIG.defaultPageSize;
  currentPage = 1;
  searchTerm = '';

  // US-041 AC3: filter by HR tags. Suggestions loaded once (same shape as ATS dashboard's
  // skillLibrary p-multiSelect) rather than per-keystroke, since this is a dropdown filter, not
  // a free-text autocomplete.
  filterTags: string[] = [];
  tagSuggestions: string[] = [];

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.loadCandidates();
    this.loadTagSuggestions();
    this.isLoading = false;
  }

  loadTagSuggestions(): void {
    this.candidateProfileService.getTagSuggestions('').subscribe({
      next: (response) => {
        this.tagSuggestions = !response.hasError && response.content ? response.content : [];
      },
      error: () => {
        this.tagSuggestions = [];
      },
    });
  }

  onTagFilterChange(): void {
    this.currentPage = 1;
    this.loadCandidates();
  }

  getPhotoUrl(candidate: ICandidateProfileSummaryResponse): string {
    if (!candidate.profilePhotoPath) return '';
    return `${Base_URL}${candidate.profilePhotoPath.startsWith('/') ? '' : '/'}${candidate.profilePhotoPath}`;
  }

  applySearch(): void {
    this.currentPage = 1;
    this.loadCandidates();
  }

  resetSearch(): void {
    this.searchTerm = '';
    this.filterTags = [];
    this.loadCandidates();
  }

  loadCandidates(): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      pageSize: this.rows,
      ...(this.searchTerm && this.searchTerm.trim() && { searchTerm: this.searchTerm.trim(), searchProperties: ['FullName', 'Email'] }),
      ...(this.filterTags.length > 0 && { tags: this.filterTags }),
    };

    this.candidateProfileService.getPaged(params).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.candidates = response.content.data || [];
          this.totalRecords = response.content.totalCount || 0;
        } else {
          this.candidates = [];
          this.totalRecords = 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.candidates = [];
        this.totalRecords = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadCandidates();
  }
}
