import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { CriterionTypeEnum, EducationLevelEnum, FilterCombinatorEnum } from '@app/@core/enums/recruitment.enum';
import { IShortlistFilterCreateRequest, IShortlistFilterCriterion, IShortlistFilterPreviewResponse } from '@app/@core/interfaces/recruitment-management/shortlist-filter.interface';
import { ISkillLibraryItemResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { IJobVacancyResponse } from '@app/@core/interfaces/recruitment-management/job-vacancy.interface';
import { ShortlistFilterService } from '@app/@core/services/recruitment/shortlist-filter/shortlist-filter.service';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { JobVacancyService } from '@app/@core/services/recruitment/job-vacancy/job-vacancy.service';
import { BreadcrumbService } from '@app/@core/services';
import { CriterionTypeOptions, newCriterion, parseSelectedSkills } from './manage-shortlist-filter.component.constants';

@Component({
  selector: 'app-manage-shortlist-filter',
  standalone: false,
  templateUrl: './manage-shortlist-filter.component.html',
  styleUrl: './manage-shortlist-filter.component.scss',
})
export class ManageShortlistFilterComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private shortlistFilterService: ShortlistFilterService,
    private candidateProfileService: CandidateProfileService,
    private jobVacancyService: JobVacancyService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  filterForm!: FormGroup;
  criteria: IShortlistFilterCriterion[] = [];
  expandedCriterionIndex: number | null = null;

  formSubmitted = false;
  isEditMode = false;
  shortlistFilterId: number | null = null;
  errorMessage = '';

  criterionTypeOptions = CriterionTypeOptions;
  combinatorOptions = [
    { label: 'Match ALL criteria (AND)', value: FilterCombinatorEnum.And },
    { label: 'Match ANY criterion (OR)', value: FilterCombinatorEnum.Or },
  ];
  educationLevelOptions = Object.values(EducationLevelEnum).map((value) => ({ label: value, value }));

  skillLibrary: ISkillLibraryItemResponse[] = [];
  skillSuggestions: ISkillLibraryItemResponse[] = [];
  jobPostings: IJobVacancyResponse[] = [];

  previewJobPostingId: number | null = null;
  previewLoading = false;
  previewError = '';
  previewResult: IShortlistFilterPreviewResponse | null = null;

  readonly CriterionTypeEnum = CriterionTypeEnum;

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(200)]],
      description: [null],
      combineWith: [FilterCombinatorEnum.And, [Validators.required]],
    });

    this.loadSkillLibrary();
    this.loadJobPostings();

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.shortlistFilterId = +idParam;
        this.isEditMode = true;
        this.loadFilter(this.shortlistFilterId);
      } else {
        this.isEditMode = false;
        this.shortlistFilterId = null;
        this.criteria = [newCriterion(0)];
      }
      this.setBreadcrumbs();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/shortlist-filters/shortlist-filter-list' },
      { title: 'Shortlist Filters', icon: 'fa-solid fa-filter', href: '/shortlist-filters/shortlist-filter-list' },
      { title: this.isEditMode ? 'Edit Filter' : 'Add Filter', icon: 'fa-solid fa-edit', href: '/shortlist-filters/manage-shortlist-filter' },
    ]);
  }

  private loadSkillLibrary(): void {
    this.candidateProfileService.getSkillLibrary().subscribe({
      next: (response) => {
        this.skillLibrary = response && !response.hasError && response.content ? response.content : [];
      },
    });
  }

  private loadJobPostings(): void {
    this.jobVacancyService.getAllJobVacancies().subscribe({
      next: (response) => {
        this.jobPostings = response && !response.hasError && response.content ? response.content : [];
      },
    });
  }

  private loadFilter(id: number): void {
    this.shortlistFilterService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.filterForm.patchValue({
            name: response.content.name,
            description: response.content.description,
            combineWith: response.content.combineWith,
          });
          this.criteria = [...response.content.criteria]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((c) => ({ ...c, selectedSkills: parseSelectedSkills(c.requiredSkillNames) }));
        } else {
          this.router.navigate(['/shortlist-filters/shortlist-filter-list']);
        }
      },
      error: () => {
        this.router.navigate(['/shortlist-filters/shortlist-filter-list']);
      },
    });
  }

  get f() {
    return this.filterForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.filterForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  toggleCriterionExpanded(index: number): void {
    this.expandedCriterionIndex = this.expandedCriterionIndex === index ? null : index;
  }

  addCriterion(): void {
    this.criteria.push(newCriterion(this.criteria.length));
    this.expandedCriterionIndex = this.criteria.length - 1;
  }

  removeCriterion(index: number): void {
    this.criteria.splice(index, 1);
    this.criteria.forEach((c, i) => (c.displayOrder = i));
    this.expandedCriterionIndex = null;
  }

  // p-autoComplete's multi-mode emits a mix of ISkillLibraryItemResponse (picked from the
  // library) and plain strings (typed free text, since forceSelection is false) - normalize
  // both to name strings before persisting.
  onRequiredSkillsChange(criterion: IShortlistFilterCriterion, skills: (ISkillLibraryItemResponse | string)[]): void {
    const names = skills.map((s) => (typeof s === 'string' ? s : s.name));
    criterion.selectedSkills = names;
    criterion.requiredSkillNames = names.join(',');
  }

  // PrimeNG's autocomplete only auto-adds untyped free text on Enter when [typeahead] is off,
  // but typeahead is what drives the library search-as-you-type - so commit free text ourselves
  // on Enter/blur instead. Harmless if the user picked a real suggestion: PrimeNG's own handler
  // already cleared the input before this bubbles up, so text is empty and this is a no-op.
  onSkillsInputCommit(event: Event, criterion: IShortlistFilterCriterion): void {
    const input = event.target as HTMLInputElement;
    const text = input.value?.trim();
    if (!text) return;
    this.onRequiredSkillsChange(criterion, [...(criterion.selectedSkills || []), text]);
    input.value = '';
  }

  filterSkillSuggestions(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim().toLowerCase();
    this.skillSuggestions = this.skillLibrary.filter((s) => s.name.toLowerCase().includes(query));
  }

  // Selected values are a mix of ISkillLibraryItemResponse (picked from the library) and plain
  // strings (typed free text, since forceSelection is false) - normalize both to name strings.
  removeSkill(criterion: IShortlistFilterCriterion, skill: ISkillLibraryItemResponse | string): void {
    const skillName = typeof skill === 'string' ? skill : skill.name;
    const remaining = (criterion.selectedSkills || []).filter((s: unknown) => (typeof s === 'string' ? s : (s as ISkillLibraryItemResponse).name) !== skillName);
    this.onRequiredSkillsChange(criterion, remaining);
  }

  criterionIsInvalid(criterion: IShortlistFilterCriterion): boolean {
    switch (criterion.criterionType) {
      case CriterionTypeEnum.EducationLevel:
        return !criterion.minEducationLevel;
      case CriterionTypeEnum.MinExperienceYears:
        return criterion.minExperienceYears == null || criterion.minExperienceYears < 0;
      case CriterionTypeEnum.RequiredSkills:
        return !criterion.requiredSkillNames?.trim();
      case CriterionTypeEnum.AgeRange:
        return criterion.minAge == null && criterion.maxAge == null;
      case CriterionTypeEnum.District:
        return !criterion.requiredDistrict?.trim();
      case CriterionTypeEnum.MinScreeningScore:
        return criterion.minScreeningScore == null;
      default:
        return true;
    }
  }

  get hasInvalidCriteria(): boolean {
    return this.criteria.length === 0 || this.criteria.some((c) => this.criterionIsInvalid(c));
  }

  runPreview(): void {
    if (!this.previewJobPostingId) {
      this.previewError = 'Select a job posting to preview against.';
      return;
    }

    this.previewLoading = true;
    this.previewError = '';
    this.previewResult = null;

    this.shortlistFilterService
      .preview({
        jobPostingId: this.previewJobPostingId,
        definition: {
          combineWith: this.filterForm.value.combineWith,
          criteria: this.criteria.map(({ selectedSkills, ...criterion }) => criterion),
        },
      })
      .subscribe({
        next: (response) => {
          this.previewLoading = false;
          if (response && !response.hasError && response.content) {
            this.previewResult = response.content;
          } else {
            this.previewError = response?.decentMessage || 'Failed to preview filter.';
          }
        },
        error: (error) => {
          this.previewLoading = false;
          this.previewError = error?.error?.decentMessage || 'Failed to preview filter.';
        },
      });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    if (this.hasInvalidCriteria) {
      this.errorMessage = 'Every criterion needs its required value(s), and the filter needs at least one criterion.';
      return;
    }

    const request: IShortlistFilterCreateRequest = {
      name: this.filterForm.value.name,
      description: this.filterForm.value.description,
      combineWith: this.filterForm.value.combineWith,
      criteria: this.criteria.map(({ selectedSkills, ...criterion }) => criterion),
    };

    if (this.isEditMode && this.shortlistFilterId) {
      this.shortlistFilterService.update(this.shortlistFilterId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/shortlist-filters/shortlist-filter-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update filter';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update filter';
        },
      });
    } else {
      this.shortlistFilterService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/shortlist-filters/shortlist-filter-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create filter';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create filter';
        },
      });
    }
  }
}
