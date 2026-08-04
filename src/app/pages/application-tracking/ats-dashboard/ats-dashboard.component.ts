import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ApplicationSourceEnum, ApplicationStatusEnum, EducationLevelEnum, ExportFormatEnum, RecruitmentEventEnum } from '@app/@core/enums/recruitment.enum';
import { ISkillLibraryItemResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { IAtsDashboardFilterParams, IApplicationStatusReason, IJobApplicationListItem } from '@app/@core/interfaces/recruitment-management/job-application.interface';
import { IJobVacancyResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy.interface';
import { ISavedSearchFilterSnapshot, ISavedSearchLookupResponse } from '@app/@core/interfaces/recruitment-management/saved-search.interface';
import { IShortlistFilterApplyResponse, IShortlistFilterLookupResponse } from '@app/@core/interfaces/recruitment-management/shortlist-filter.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { saveFileResponse } from '@app/@core/services/recruitment/cv-bank/cv-bank.service';
import { ExportRequestService } from '@app/@core/services/recruitment/export-request/export-request.service';
import { JobApplicationService } from '@app/@core/services/recruitment/job-application/job-application.service';
import { JobVacancyService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy.service';
import { SavedSearchService } from '@app/@core/services/recruitment/saved-search/saved-search.service';
import { ShortlistFilterService } from '@app/@core/services/recruitment/shortlist-filter/shortlist-filter.service';
import { ToastService } from '@app/@core/services/misc/toast.service';
import { UI_CONFIG } from '@app/@core/constants';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ApplicationStatusOptions, StatusesRequiringReason } from '../application-status-transitions.constants';
import { AtsDashboardColumns } from './ats-dashboard.component.constants';

/** Session-persisted candidate-attribute + scalar filter state (US-050 AC5). */
const FILTER_SESSION_KEY = 'ats-dashboard-filters';

@Component({
  selector: 'app-ats-dashboard',
  standalone: false,
  templateUrl: './ats-dashboard.component.html',
  styleUrl: './ats-dashboard.component.scss',
})
export class AtsDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private jobApplicationService: JobApplicationService,
    private jobVacancyService: JobVacancyService,
    private shortlistFilterService: ShortlistFilterService,
    private savedSearchService: SavedSearchService,
    private candidateProfileService: CandidateProfileService,
    private exportRequestService: ExportRequestService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  applications: IJobApplicationListItem[] = [];
  selectedApplications: IJobApplicationListItem[] = [];
  jobPostings: IJobVacancyResponse[] = [];
  statusOptions = ApplicationStatusOptions;
  sourceOptions = Object.values(ApplicationSourceEnum).map((value) => ({ label: value, value }));

  sortedColumn = '';
  isLoading = true;
  loading = false;
  totalRecords = 0;
  UI_CONFIG = UI_CONFIG;
  rows = UI_CONFIG.defaultPageSize;
  currentPage = 1;
  sortBy = '';
  sortDirection = '';
  columns = AtsDashboardColumns;
  filtersCollapsed = true;

  // Filters (US-035 AC2)
  filterJobPostingId: number | null = null;
  filterStatus: ApplicationStatusEnum | null = null;
  filterSource: ApplicationSourceEnum | null = null;
  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;
  /** EP-14 US-109 AC2 */
  filterStaleOnly = false;

  // Candidate-attribute filters, scoped to one vacancy (US-050 AC1/AC2)
  filterMinEducationLevel: EducationLevelEnum | null = null;
  filterMinExperienceYears: number | null = null;
  filterMaxExperienceYears: number | null = null;
  filterSkills: string[] = [];
  filterLocation: string | null = null;
  filterMinAge: number | null = null;
  filterMaxAge: number | null = null;
  filterTags: string[] = [];

  educationLevelOptions = Object.values(EducationLevelEnum).map((value) => ({ label: value, value }));
  skillLibrary: ISkillLibraryItemResponse[] = [];
  filterSkillSuggestions: ISkillLibraryItemResponse[] = [];
  tagSuggestions: string[] = [];

  private filterChange$ = new Subject<void>();

  // Export (EP-13 US-100/104) - queues an async export of every application matching the current filters
  exportFormat: ExportFormatEnum = ExportFormatEnum.Xlsx;
  exportFormatOptions = [
    { label: 'Excel (.xlsx)', value: ExportFormatEnum.Xlsx },
    { label: 'CSV', value: ExportFormatEnum.Csv },
  ];
  exporting = false;

  // Bulk action (US-035 AC5)
  bulkToStatus: ApplicationStatusEnum | null = null;
  bulkReasonId: number | null = null;
  bulkNote = '';
  bulkReasonOptions: IApplicationStatusReason[] = [];
  bulkStatusOptions = ApplicationStatusOptions;
  bulkApplying = false;

  // Bulk download CVs (US-101) - batches at/under this size download synchronously; larger
  // batches queue through the EP-13 F1 export-request async queue instead.
  readonly BULK_DOWNLOAD_CVS_SYNC_MAX = 20;
  bulkDownloadingCvs = false;

  // Bulk notify (EP-09 US-076) - only the events US-075 actually dispatches on are offered here.
  bulkNotifyEvent: RecruitmentEventEnum | null = null;
  bulkNotifying = false;
  bulkNotifyEventOptions = [
    { label: 'Application Submitted', value: RecruitmentEventEnum.ApplicationSubmitted },
    { label: 'Application Status Changed', value: RecruitmentEventEnum.ApplicationStatusChanged },
    { label: 'Application Withdrawn', value: RecruitmentEventEnum.ApplicationWithdrawn },
    { label: 'Candidate Action Required', value: RecruitmentEventEnum.CandidateActionRequired },
  ];

  // Bulk selection across pages (US-047 AC5)
  selectAllMatchingActive = false;
  selectedAllIds: number[] = [];
  loadingSelectAll = false;
  shortlisting = false;

  // Apply shortlist filter to vacancy (US-044)
  shortlistFilters: IShortlistFilterLookupResponse[] = [];
  selectedShortlistFilterId: number | null = null;
  applyingShortlistFilter = false;
  shortlistApplySummary: IShortlistFilterApplyResponse | null = null;
  shortlistApplySummaryVisible = false;

  // AI-Powered Auto-Shortlisting (US-046)
  autoShortlistDialogVisible = false;

  // Saved search bookmarks (US-048)
  savedSearches: ISavedSearchLookupResponse[] = [];
  selectedSavedSearchId: number | null = null;
  applyingSavedSearch = false;

  saveSearchDialogVisible = false;
  saveSearchName = '';
  saveSearchIsShared = false;
  savingSearch = false;

  manageSavedSearchesDialogVisible = false;
  editingSavedSearchId: number | null = null;
  editingSavedSearchName = '';
  editingSavedSearchIsShared = false;

  get skeletonItems() {
    return Array(this.rows)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.restoreFiltersFromSession();
    this.applyDeepLinkQueryParams();
    this.filterChange$.pipe(debounceTime(400)).subscribe(() => {
      this.currentPage = 1;
      this.filtersCollapsed = true;
      this.saveFiltersToSession();
      this.loadApplications();
    });

    this.loadJobPostings();
    this.loadApplications();
    this.loadShortlistFilters();
    this.loadSavedSearches();
    this.loadSkillLibrary();
    this.loadTagSuggestions();
    this.isLoading = false;
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.filterChange$.complete();
  }

  private loadSkillLibrary(): void {
    this.candidateProfileService.getSkillLibrary().subscribe({
      next: (response) => {
        this.skillLibrary = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  private loadTagSuggestions(): void {
    this.candidateProfileService.getTagSuggestions('').subscribe({
      next: (response) => {
        this.tagSuggestions = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  loadJobPostings(): void {
    this.jobVacancyService.getAllJobVacancies().subscribe({
      next: (response) => {
        this.jobPostings = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  onSelectionChange(event: any): void {
    this.selectedApplications = event;
    this.selectAllMatchingActive = false;
    this.selectedAllIds = [];
    this.bulkToStatus = null;
    this.bulkReasonId = null;
    this.bulkNote = '';
    this.bulkNotifyEvent = null;
    this.cdr.detectChanges();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.filtersCollapsed = true;
    this.saveFiltersToSession();
    this.loadApplications();
  }

  resetFilters(): void {
    this.filterJobPostingId = null;
    this.filterStatus = null;
    this.filterSource = null;
    this.filterDateFrom = null;
    this.filterDateTo = null;
    this.filterStaleOnly = false;
    this.resetCandidateAttributeFilters();
    this.currentPage = 1;
    this.filtersCollapsed = false;
    this.saveFiltersToSession();
    this.loadApplications();
  }

  private resetCandidateAttributeFilters(): void {
    this.filterMinEducationLevel = null;
    this.filterMinExperienceYears = null;
    this.filterMaxExperienceYears = null;
    this.filterSkills = [];
    this.filterLocation = null;
    this.filterMinAge = null;
    this.filterMaxAge = null;
    this.filterTags = [];
  }

  /** Candidate-attribute filters real-time apply (US-050 AC3) - debounced via filterChange$. */
  onCandidateAttributeFilterChange(): void {
    this.filterChange$.next();
  }

  onFilterSkillSearch(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim().toLowerCase();
    this.filterSkillSuggestions = this.skillLibrary.filter((s) => s.name.toLowerCase().includes(query));
  }

  // p-autoComplete's multi-mode emits a mix of ISkillLibraryItemResponse (picked from the
  // library) and plain strings (typed free text, since forceSelection is false) - normalize
  // both to name strings, matching the shortlist filter's Required Skills field.
  onFilterSkillsChange(skills: (ISkillLibraryItemResponse | string)[]): void {
    this.filterSkills = skills.map((s) => (typeof s === 'string' ? s : s.name));
    this.onCandidateAttributeFilterChange();
  }

  removeFilterSkill(skill: ISkillLibraryItemResponse | string): void {
    const skillName = typeof skill === 'string' ? skill : skill.name;
    this.filterSkills = this.filterSkills.filter((s) => s !== skillName);
    this.onCandidateAttributeFilterChange();
  }

  // PrimeNG only auto-adds untyped free text on Enter when [typeahead] is off, which would kill
  // the library search-as-you-type - so commit free text ourselves on Enter/blur instead.
  onFilterSkillsInputCommit(event: Event): void {
    const input = event.target as HTMLInputElement;
    const text = input.value?.trim();
    if (!text) return;
    this.filterSkills = [...this.filterSkills, text];
    this.onCandidateAttributeFilterChange();
    input.value = '';
  }

  /** Filter-only query params (no page/sort) shared by loadApplications and select-all-matching (US-047 AC5). */
  buildFilterParams(): IAtsDashboardFilterParams {
    return {
      ...(this.filterJobPostingId && { jobPostingId: this.filterJobPostingId }),
      ...(this.filterStatus && { status: this.filterStatus }),
      ...(this.filterSource && { source: this.filterSource }),
      ...(this.filterDateFrom && { dateFrom: this.filterDateFrom.toISOString() }),
      ...(this.filterDateTo && { dateTo: this.filterDateTo.toISOString() }),
      ...(this.filterMinEducationLevel && { minEducationLevel: this.filterMinEducationLevel }),
      ...(this.filterMinExperienceYears != null && { minExperienceYears: this.filterMinExperienceYears }),
      ...(this.filterMaxExperienceYears != null && { maxExperienceYears: this.filterMaxExperienceYears }),
      ...(this.filterSkills.length > 0 && { skills: this.filterSkills }),
      ...(this.filterLocation && { location: this.filterLocation }),
      ...(this.filterMinAge != null && { minAge: this.filterMinAge }),
      ...(this.filterMaxAge != null && { maxAge: this.filterMaxAge }),
      ...(this.filterTags.length > 0 && { tags: this.filterTags }),
      ...(this.filterStaleOnly && { staleOnly: true }),
    };
  }

  /** Queues an async export of every application matching the current filters (EP-13 US-100/104) - not just the current page. */
  exportCandidateList(): void {
    this.exporting = true;
    this.exportRequestService.requestCandidateListExport({ filter: this.buildFilterParams(), format: this.exportFormat }).subscribe({
      next: () => {
        this.exporting = false;
        this.toast.success({ detail: 'Export queued - you will be notified when it is ready to download (see Export Requests).' });
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.exporting = false;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to queue export.' });
        this.cdr.detectChanges();
      },
    });
  }

  /** EP-14 US-109 AC5: queues an async export of the tracker columns (Vacancy/Candidate/Stage/
   * Status/LastUpdated/DaysInStage/AssignedHR) for every application matching the current filters. */
  exportTracker(): void {
    this.exporting = true;
    this.exportRequestService.requestJobApplicationTrackerExport({ filter: this.buildFilterParams(), format: this.exportFormat }).subscribe({
      next: () => {
        this.exporting = false;
        this.toast.success({ detail: 'Tracker export queued - you will be notified when it is ready to download (see Export Requests).' });
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.exporting = false;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to queue tracker export.' });
        this.cdr.detectChanges();
      },
    });
  }

  // ── Active filter chips (US-050 AC4) ────────────────────────────

  get activeFilterChips(): { key: string; label: string }[] {
    const chips: { key: string; label: string }[] = [];
    if (this.filterJobPostingId) {
      const title = this.jobPostings.find((j) => j.jobPostingId === this.filterJobPostingId)?.title;
      chips.push({ key: 'filterJobPostingId', label: `Job Posting: ${title ?? this.filterJobPostingId}` });
    }
    if (this.filterStatus) chips.push({ key: 'filterStatus', label: `Status: ${this.filterStatus}` });
    if (this.filterSource) chips.push({ key: 'filterSource', label: `Source: ${this.filterSource}` });
    if (this.filterDateFrom) chips.push({ key: 'filterDateFrom', label: `From: ${this.filterDateFrom.toLocaleDateString()}` });
    if (this.filterDateTo) chips.push({ key: 'filterDateTo', label: `To: ${this.filterDateTo.toLocaleDateString()}` });
    if (this.filterMinEducationLevel) chips.push({ key: 'filterMinEducationLevel', label: `Education: ${this.filterMinEducationLevel}+` });
    if (this.filterMinExperienceYears != null || this.filterMaxExperienceYears != null) {
      chips.push({ key: 'filterExperience', label: `Experience: ${this.filterMinExperienceYears ?? 0}-${this.filterMaxExperienceYears ?? '∞'} yrs` });
    }
    if (this.filterSkills.length > 0) chips.push({ key: 'filterSkills', label: `Skills: ${this.filterSkills.join(', ')}` });
    if (this.filterLocation) chips.push({ key: 'filterLocation', label: `Location: ${this.filterLocation}` });
    if (this.filterMinAge != null || this.filterMaxAge != null) {
      chips.push({ key: 'filterAge', label: `Age: ${this.filterMinAge ?? 0}-${this.filterMaxAge ?? '∞'}` });
    }
    if (this.filterTags.length > 0) chips.push({ key: 'filterTags', label: `Tags: ${this.filterTags.join(', ')}` });
    if (this.filterStaleOnly) chips.push({ key: 'filterStaleOnly', label: 'Stale only' });
    return chips;
  }

  removeFilterChip(key: string): void {
    switch (key) {
      case 'filterJobPostingId':
        this.filterJobPostingId = null;
        this.resetCandidateAttributeFilters();
        break;
      case 'filterStatus':
        this.filterStatus = null;
        break;
      case 'filterSource':
        this.filterSource = null;
        break;
      case 'filterDateFrom':
        this.filterDateFrom = null;
        break;
      case 'filterDateTo':
        this.filterDateTo = null;
        break;
      case 'filterMinEducationLevel':
        this.filterMinEducationLevel = null;
        break;
      case 'filterExperience':
        this.filterMinExperienceYears = null;
        this.filterMaxExperienceYears = null;
        break;
      case 'filterSkills':
        this.filterSkills = [];
        break;
      case 'filterLocation':
        this.filterLocation = null;
        break;
      case 'filterAge':
        this.filterMinAge = null;
        this.filterMaxAge = null;
        break;
      case 'filterTags':
        this.filterTags = [];
        break;
      case 'filterStaleOnly':
        this.filterStaleOnly = false;
        break;
    }
    this.currentPage = 1;
    this.saveFiltersToSession();
    this.loadApplications();
  }

  // ── Session persistence (US-050 AC5) ────────────────────────────

  private saveFiltersToSession(): void {
    const state = {
      filterJobPostingId: this.filterJobPostingId,
      filterStatus: this.filterStatus,
      filterSource: this.filterSource,
      filterDateFrom: this.filterDateFrom ? this.filterDateFrom.toISOString() : null,
      filterDateTo: this.filterDateTo ? this.filterDateTo.toISOString() : null,
      filterMinEducationLevel: this.filterMinEducationLevel,
      filterMinExperienceYears: this.filterMinExperienceYears,
      filterMaxExperienceYears: this.filterMaxExperienceYears,
      filterSkills: this.filterSkills,
      filterLocation: this.filterLocation,
      filterMinAge: this.filterMinAge,
      filterMaxAge: this.filterMaxAge,
      filterTags: this.filterTags,
      filterStaleOnly: this.filterStaleOnly,
    };
    sessionStorage.setItem(FILTER_SESSION_KEY, JSON.stringify(state));
  }

  private restoreFiltersFromSession(): void {
    const raw = sessionStorage.getItem(FILTER_SESSION_KEY);
    if (!raw) return;

    try {
      const state = JSON.parse(raw);
      this.filterJobPostingId = state.filterJobPostingId ?? null;
      this.filterStatus = state.filterStatus ?? null;
      this.filterSource = state.filterSource ?? null;
      this.filterDateFrom = state.filterDateFrom ? new Date(state.filterDateFrom) : null;
      this.filterDateTo = state.filterDateTo ? new Date(state.filterDateTo) : null;
      this.filterMinEducationLevel = state.filterMinEducationLevel ?? null;
      this.filterMinExperienceYears = state.filterMinExperienceYears ?? null;
      this.filterMaxExperienceYears = state.filterMaxExperienceYears ?? null;
      this.filterSkills = state.filterSkills ?? [];
      this.filterLocation = state.filterLocation ?? null;
      this.filterMinAge = state.filterMinAge ?? null;
      this.filterMaxAge = state.filterMaxAge ?? null;
      this.filterTags = state.filterTags ?? [];
      this.filterStaleOnly = state.filterStaleOnly ?? false;
    } catch {
      sessionStorage.removeItem(FILTER_SESSION_KEY);
    }
  }

  /** EP-14 US-105 AC3: dashboard cards deep-link here with a jobPostingId/staleOnly query param -
   * applied on top of the restored session filters, since a card click should override them. */
  private applyDeepLinkQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    const jobPostingId = params.get('jobPostingId');
    const staleOnly = params.get('staleOnly');

    if (jobPostingId) this.filterJobPostingId = +jobPostingId;
    if (staleOnly === 'true') this.filterStaleOnly = true;
  }

  loadApplications(): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      pageSize: this.rows,
      ...(this.sortBy && { sortBy: this.sortBy }),
      ...(this.sortDirection && { sortDirection: this.sortDirection }),
      ...this.buildFilterParams(),
    };

    this.jobApplicationService.getDashboardPaged(params).subscribe({
      next: (response) => {
        if (!response.hasError && response.content) {
          this.applications = response.content.data || [];
          this.totalRecords = response.content.totalCount || 0;
          this.selectedApplications = [];
          this.selectAllMatchingActive = false;
          this.selectedAllIds = [];
        } else {
          this.applications = [];
          this.totalRecords = 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.applications = [];
        this.totalRecords = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadApplications();
  }

  onSort(event: SortEvent): void {
    this.sortedColumn = event.field || '';
    this.sortBy = event.field || '';
    this.sortDirection = event.order === 1 ? 'asc' : 'desc';
    this.currentPage = 1;
    this.loadApplications();
  }

  formatEnumLabel(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  openDetail(application: IJobApplicationListItem): void {
    this.router.navigate(['/applications', application.jobApplicationId]);
  }

  viewDuplicates(): void {
    if (!this.filterJobPostingId) return;
    const title = this.jobPostings.find((p) => p.jobPostingId === this.filterJobPostingId)?.title;
    this.router.navigate(['/applications/duplicates', this.filterJobPostingId], { queryParams: title ? { title } : {} });
  }

  openAutoShortlistDialog(): void {
    this.autoShortlistDialogVisible = true;
  }

  loadShortlistFilters(): void {
    this.shortlistFilterService.getLookup().subscribe({
      next: (response) => {
        this.shortlistFilters = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  canApplyShortlistFilter(): boolean {
    return !!this.filterJobPostingId && !!this.selectedShortlistFilterId;
  }

  applyShortlistFilter(event: Event): void {
    if (!this.filterJobPostingId || !this.selectedShortlistFilterId) return;

    const filterName = this.shortlistFilters.find((f) => f.shortlistFilterId === this.selectedShortlistFilterId)?.name;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Apply "${filterName}" to every application of this vacancy? Candidates who meet the criteria will be moved to Shortlisted.`,
      header: 'Apply Shortlist Filter',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.applyingShortlistFilter = true;

        this.shortlistFilterService
          .apply({ shortlistFilterId: this.selectedShortlistFilterId!, jobPostingId: this.filterJobPostingId! })
          .subscribe({
            next: (response) => {
              this.applyingShortlistFilter = false;
              this.shortlistApplySummary = response?.content ?? null;
              this.shortlistApplySummaryVisible = true;
              this.loadApplications();
            },
            error: (error) => {
              this.applyingShortlistFilter = false;
              this.toast.error({ detail: error?.error?.decentMessage || 'Failed to apply shortlist filter.' });
            },
          });
      },
    });
  }

  // ── Saved search bookmarks (US-048) ─────────────────────────────

  loadSavedSearches(): void {
    this.savedSearchService.getLookup().subscribe({
      next: (response) => {
        this.savedSearches = response && !response.hasError && response.content ? response.content : [];
        this.cdr.detectChanges();
      },
    });
  }

  private currentFilterSnapshot(): ISavedSearchFilterSnapshot {
    return {
      filterJobPostingId: this.filterJobPostingId,
      filterStatus: this.filterStatus,
      filterSource: this.filterSource,
      filterDateFrom: this.filterDateFrom ? this.filterDateFrom.toISOString() : null,
      filterDateTo: this.filterDateTo ? this.filterDateTo.toISOString() : null,
      filterMinEducationLevel: this.filterMinEducationLevel,
      filterMinExperienceYears: this.filterMinExperienceYears,
      filterMaxExperienceYears: this.filterMaxExperienceYears,
      filterSkills: this.filterSkills,
      filterLocation: this.filterLocation,
      filterMinAge: this.filterMinAge,
      filterMaxAge: this.filterMaxAge,
    };
  }

  openSaveSearchDialog(): void {
    this.saveSearchName = '';
    this.saveSearchIsShared = false;
    this.saveSearchDialogVisible = true;
  }

  confirmSaveSearch(): void {
    if (!this.saveSearchName.trim()) return;

    this.savingSearch = true;
    this.savedSearchService
      .create({
        name: this.saveSearchName.trim(),
        isShared: this.saveSearchIsShared,
        filterJson: JSON.stringify(this.currentFilterSnapshot()),
      })
      .subscribe({
        next: () => {
          this.savingSearch = false;
          this.saveSearchDialogVisible = false;
          this.toast.success({ detail: 'Search saved.' });
          this.loadSavedSearches();
        },
        error: (error) => {
          this.savingSearch = false;
          this.toast.error({ detail: error?.error?.decentMessage || 'Failed to save search.' });
        },
      });
  }

  canApplySavedSearch(): boolean {
    return !!this.selectedSavedSearchId;
  }

  applySavedSearch(): void {
    const search = this.savedSearches.find((s) => s.savedSearchId === this.selectedSavedSearchId);
    if (!search) return;

    try {
      const snapshot: ISavedSearchFilterSnapshot = JSON.parse(search.filterJson);
      this.filterJobPostingId = snapshot.filterJobPostingId ?? null;
      this.filterStatus = snapshot.filterStatus ?? null;
      this.filterSource = snapshot.filterSource ?? null;
      this.filterDateFrom = snapshot.filterDateFrom ? new Date(snapshot.filterDateFrom) : null;
      this.filterDateTo = snapshot.filterDateTo ? new Date(snapshot.filterDateTo) : null;
      this.filterMinEducationLevel = snapshot.filterMinEducationLevel ?? null;
      this.filterMinExperienceYears = snapshot.filterMinExperienceYears ?? null;
      this.filterMaxExperienceYears = snapshot.filterMaxExperienceYears ?? null;
      this.filterSkills = snapshot.filterSkills ?? [];
      this.filterLocation = snapshot.filterLocation ?? null;
      this.filterMinAge = snapshot.filterMinAge ?? null;
      this.filterMaxAge = snapshot.filterMaxAge ?? null;
    } catch {
      this.toast.error({ detail: 'This saved search is corrupted and could not be applied.' });
      return;
    }

    this.currentPage = 1;
    this.saveFiltersToSession();
    this.loadApplications();
  }

  openManageSavedSearchesDialog(): void {
    this.cancelEditSavedSearch();
    this.manageSavedSearchesDialogVisible = true;
  }

  startEditSavedSearch(search: ISavedSearchLookupResponse): void {
    this.editingSavedSearchId = search.savedSearchId;
    this.editingSavedSearchName = search.name;
    this.editingSavedSearchIsShared = search.isShared;
  }

  cancelEditSavedSearch(): void {
    this.editingSavedSearchId = null;
    this.editingSavedSearchName = '';
    this.editingSavedSearchIsShared = false;
  }

  confirmEditSavedSearch(search: ISavedSearchLookupResponse): void {
    if (!this.editingSavedSearchName.trim()) return;

    this.savedSearchService
      .update(search.savedSearchId, {
        name: this.editingSavedSearchName.trim(),
        isShared: this.editingSavedSearchIsShared,
        filterJson: search.filterJson,
      })
      .subscribe({
        next: () => {
          this.toast.success({ detail: 'Saved search updated.' });
          this.cancelEditSavedSearch();
          this.loadSavedSearches();
        },
        error: (error) => {
          this.toast.error({ detail: error?.error?.decentMessage || 'Failed to update saved search.' });
        },
      });
  }

  deleteSavedSearch(search: ISavedSearchLookupResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete saved search: ${search.name}?`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.savedSearchService.delete(search.savedSearchId).subscribe({
          next: () => {
            if (this.selectedSavedSearchId === search.savedSearchId) this.selectedSavedSearchId = null;
            this.toast.success({ detail: 'Saved search deleted.' });
            this.loadSavedSearches();
          },
          error: (error) => {
            this.toast.error({ detail: error?.error?.decentMessage || 'Failed to delete saved search.' });
          },
        });
      },
    });
  }

  // ── Bulk selection across pages (US-047 AC5) ────────────────────

  selectedCount(): number {
    return this.selectAllMatchingActive ? this.selectedAllIds.length : this.selectedApplications.length;
  }

  getSelectedIds(): number[] {
    return this.selectAllMatchingActive ? this.selectedAllIds : this.selectedApplications.map((a) => a.jobApplicationId);
  }

  selectAllMatching(): void {
    this.loadingSelectAll = true;

    this.jobApplicationService.getDashboardMatchingIds(this.buildFilterParams()).subscribe({
      next: (response) => {
        this.loadingSelectAll = false;
        this.selectedAllIds = response && !response.hasError && response.content ? response.content : [];
        this.selectAllMatchingActive = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loadingSelectAll = false;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to select all matching applications.' });
      },
    });
  }

  clearSelection(): void {
    this.selectedApplications = [];
    this.selectedAllIds = [];
    this.selectAllMatchingActive = false;
  }

  // ── Dedicated "Shortlist Selected" bulk action (US-047 AC2/AC3) ─

  shortlistSelected(event: Event): void {
    const ids = this.getSelectedIds();
    if (ids.length === 0) return;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Move ${ids.length} application(s) to Shortlisted?`,
      header: 'Shortlist Selected',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.shortlisting = true;

        this.jobApplicationService
          .bulkUpdateStatus({ jobApplicationIds: ids, toStatus: ApplicationStatusEnum.Shortlisted })
          .subscribe({
            next: (response) => {
              this.shortlisting = false;
              const result = response?.content;
              if (result && result.failed.length > 0) {
                this.toast.warn({ detail: `${result.succeededIds.length} shortlisted, ${result.failed.length} failed.` });
              } else {
                this.toast.success({ detail: 'Applications shortlisted.' });
              }
              this.clearSelection();
              this.loadApplications();
            },
            error: (error) => {
              this.shortlisting = false;
              this.toast.error({ detail: error?.error?.decentMessage || 'Failed to shortlist applications.' });
            },
          });
      },
    });
  }

  onBulkStatusChange(status: ApplicationStatusEnum | null): void {
    this.bulkReasonId = null;
    this.bulkReasonOptions = [];

    if (status && StatusesRequiringReason.includes(status)) {
      this.jobApplicationService.getStatusReasons(status).subscribe({
        next: (response) => {
          this.bulkReasonOptions = response && !response.hasError && response.content ? response.content : [];
          this.cdr.detectChanges();
        },
      });
    }
  }

  bulkRequiresReason(): boolean {
    return !!this.bulkToStatus && StatusesRequiringReason.includes(this.bulkToStatus);
  }

  canApplyBulk(): boolean {
    if (!this.bulkToStatus || this.selectedCount() === 0) return false;
    return !this.bulkRequiresReason() || !!this.bulkReasonId;
  }

  applyBulkStatus(event: Event): void {
    if (!this.bulkToStatus) return;
    const ids = this.getSelectedIds();

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Move ${ids.length} application(s) to ${this.formatEnumLabel(this.bulkToStatus)}?`,
      header: 'Confirm Bulk Status Update',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.bulkApplying = true;

        this.jobApplicationService
          .bulkUpdateStatus({
            jobApplicationIds: ids,
            toStatus: this.bulkToStatus!,
            reasonId: this.bulkReasonId ?? undefined,
            note: this.bulkNote || undefined,
          })
          .subscribe({
            next: (response) => {
              this.bulkApplying = false;
              const result = response?.content;
              if (result && result.failed.length > 0) {
                this.toast.warn({ detail: `${result.succeededIds.length} succeeded, ${result.failed.length} failed.` });
              } else {
                this.toast.success({ detail: 'Applications updated.' });
              }
              this.bulkToStatus = null;
              this.bulkReasonId = null;
              this.bulkNote = '';
              this.clearSelection();
              this.loadApplications();
            },
            error: (error) => {
              this.bulkApplying = false;
              this.toast.error({ detail: error?.error?.decentMessage || 'Failed to update applications.' });
            },
          });
      },
    });
  }

  // ── Bulk notify (EP-09 US-076) ───────────────────────────────────

  notifySelected(event: Event): void {
    if (!this.bulkNotifyEvent) return;
    const ids = this.getSelectedIds();
    if (ids.length === 0) return;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Re-send the "${this.formatEnumLabel(this.bulkNotifyEvent)}" notification for ${ids.length} application(s)?`,
      header: 'Confirm Bulk Notify',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.bulkNotifying = true;

        this.jobApplicationService.bulkNotify({ jobApplicationIds: ids, recruitmentEvent: this.bulkNotifyEvent! }).subscribe({
          next: (response) => {
            this.bulkNotifying = false;
            const result = response?.content;
            if (result && result.failed.length > 0) {
              this.toast.warn({ detail: `${result.succeededIds.length} notified, ${result.failed.length} failed.` });
            } else {
              this.toast.success({ detail: 'Notifications sent.' });
            }
            this.bulkNotifyEvent = null;
          },
          error: (error) => {
            this.bulkNotifying = false;
            this.toast.error({ detail: error?.error?.decentMessage || 'Failed to send notifications.' });
          },
        });
      },
    });
  }

  // ── Bulk download CVs (US-101) ────────────────────────────────────

  bulkDownloadCvs(): void {
    const ids = this.getSelectedIds();
    if (ids.length === 0) return;

    this.bulkDownloadingCvs = true;

    if (ids.length <= this.BULK_DOWNLOAD_CVS_SYNC_MAX) {
      this.jobApplicationService.bulkDownloadCvs(ids).subscribe({
        next: (response) => {
          this.bulkDownloadingCvs = false;
          saveFileResponse(response, 'Candidate-CVs.zip');
          this.cdr.detectChanges();
        },
        error: () => {
          this.bulkDownloadingCvs = false;
          this.toast.error({ detail: 'Failed to download CVs.' });
          this.cdr.detectChanges();
        },
      });
      return;
    }

    this.exportRequestService.requestBulkCvZipExport(ids).subscribe({
      next: () => {
        this.bulkDownloadingCvs = false;
        this.toast.success({ detail: 'Large batch queued - you will be notified when the CV ZIP is ready (see Export Requests).' });
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.bulkDownloadingCvs = false;
        this.toast.error({ detail: error?.error?.decentMessage || 'Failed to queue CV export.' });
        this.cdr.detectChanges();
      },
    });
  }
}
