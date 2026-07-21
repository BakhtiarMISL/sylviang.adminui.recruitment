import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  ICandidateEducationCreateRequest,
  ICandidateEducationResponse,
  ICandidateResumeParsedEducation,
  IUniversityLibraryItemResponse,
} from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { catchError, concatMap, from, Observable, of, toArray } from 'rxjs';
import { AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { DivisionResultOptions, EducationLevelOptions, GradingSystemOptions } from './education-section.component.constants';

@Component({
  selector: 'app-education-section',
  standalone: false,
  templateUrl: './education-section.component.html',
  styleUrl: './education-section.component.scss',
})
export class EducationSectionComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private candidateProfileService: CandidateProfileService,
  ) {
    this.form = this.fb.group({
      degreeTitle: [null, [Validators.required, Validators.maxLength(200)]],
      institution: [null, [Validators.required, Validators.maxLength(200)]],
      universityLibraryItemId: [null],
      educationLevel: [null],
      passingYear: [null, [Validators.required, Validators.min(1950), Validators.max(new Date().getFullYear())]],
      gradingSystem: [null],
      result: [null, [Validators.required, Validators.maxLength(50)]],
      majorSubject: [null, [Validators.maxLength(200)]],
    });
  }

  educationLevelOptions = EducationLevelOptions;
  gradingSystemOptions = GradingSystemOptions;
  divisionResultOptions = DivisionResultOptions;
  form: FormGroup;
  formSubmitted = false;
  saving = false;
  saveError = '';

  items: ICandidateEducationResponse[] = [];
  loading = false;
  editingId: number | null = null;

  universityLibrary: IUniversityLibraryItemResponse[] = [];
  universitySuggestions: IUniversityLibraryItemResponse[] = [];

  // Best-effort suggestions from a parsed resume (see MyProfileComponent.onResumeParsed).
  // Nothing here is saved automatically - clicking "Use" only opens the add form pre-filled
  // so the candidate reviews/corrects and hits Save themselves.
  prefillSuggestions: ICandidateResumeParsedEducation[] = [];
  savingAll = false;

  stagePrefill(suggestions: ICandidateResumeParsedEducation[]): void {
    this.prefillSuggestions = suggestions;
  }

  useSuggestion(suggestion: ICandidateResumeParsedEducation, index: number): void {
    this.startAdd();
    this.form.patchValue({
      degreeTitle: suggestion.degreeTitle,
      institution: suggestion.institution,
      educationLevel: suggestion.educationLevel ?? null,
      universityLibraryItemId: suggestion.universityLibraryItemId,
      passingYear: suggestion.passingYear,
      result: suggestion.result,
      majorSubject: suggestion.majorSubject,
    });
    this.prefillSuggestions = this.prefillSuggestions.filter((_, i) => i !== index);
  }

  dismissSuggestion(index: number): void {
    this.prefillSuggestions = this.prefillSuggestions.filter((_, i) => i !== index);
  }

  isSuggestionReady(suggestion: ICandidateResumeParsedEducation): boolean {
    return !!(suggestion.degreeTitle && suggestion.institution && suggestion.passingYear && suggestion.result);
  }

  hasReadySuggestions(): boolean {
    return this.prefillSuggestions.some((s) => this.isSuggestionReady(s));
  }

  // Bulk-saves every "ready" (all required fields present) suggestion directly, without opening
  // the per-entry form - the chip (with its Dismiss) is the review surface for this action.
  // Suggestions missing a required field are left behind for the manual "Use" flow.
  useAllSuggestions(): void {
    const ready = this.prefillSuggestions.filter((s) => this.isSuggestionReady(s));
    if (ready.length === 0) return;

    this.savingAll = true;
    from(ready)
      .pipe(
        concatMap((suggestion) => {
          const request: ICandidateEducationCreateRequest = {
            degreeTitle: suggestion.degreeTitle!,
            institution: suggestion.institution!,
            universityLibraryItemId: suggestion.universityLibraryItemId,
            educationLevel: suggestion.educationLevel ?? null,
            passingYear: suggestion.passingYear!,
            result: suggestion.result!,
            majorSubject: suggestion.majorSubject ?? null,
          };
          // Each suggestion succeeds/fails independently - one bad entry must not block the rest.
          return this.candidateProfileService.addEducation(request).pipe(
            catchError(() => of(null)),
            concatMap((response) => of({ suggestion, succeeded: !!response && !response.hasError })),
          );
        }),
        toArray(),
      )
      .subscribe((results) => {
        this.savingAll = false;
        const succeeded = new Set(results.filter((r) => r.succeeded).map((r) => r.suggestion));
        this.prefillSuggestions = this.prefillSuggestions.filter((s) => !succeeded.has(s));
        this.loadEducation();
        this.saved.emit();
      });
  }

  showForm = false;

  ngOnInit(): void {
    this.loadEducation();
    this.loadUniversityLibrary();
  }

  loadEducation(): void {
    this.loading = true;
    this.candidateProfileService.getEducation().subscribe({
      next: (response) => {
        this.items = !response.hasError && response.content ? response.content : [];
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      },
    });
  }

  loadUniversityLibrary(): void {
    this.candidateProfileService.getUniversityLibrary().subscribe({
      next: (response) => {
        this.universityLibrary = !response.hasError && response.content ? response.content : [];
      },
      error: () => {
        this.universityLibrary = [];
      },
    });
  }

  filterUniversity(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim().toLowerCase();
    this.universitySuggestions = this.universityLibrary.filter((u) => u.name.toLowerCase().includes(query) || u.code.toLowerCase().includes(query));
  }

  onUniversitySelect(event: AutoCompleteSelectEvent): void {
    const selected = event.value as IUniversityLibraryItemResponse;
    this.form.patchValue({ institution: selected.name, universityLibraryItemId: selected.universityLibraryItemId });
  }

  // Typing free text (no library match) clears the library link - UniversityLibraryItemId stays
  // null and the raw text is saved as-is, same "null = free text" convention as CandidateSkill.
  onInstitutionInput(): void {
    const currentName = this.form.get('institution')?.value;
    const currentLinkedId = this.form.get('universityLibraryItemId')?.value;
    if (currentLinkedId) {
      const linked = this.universityLibrary.find((u) => u.universityLibraryItemId === currentLinkedId);
      if (!linked || linked.name !== currentName) {
        this.form.patchValue({ universityLibraryItemId: null }, { emitEvent: false });
      }
    }
  }

  // Switching to/from "Division" changes what the Result field means (free-text GPA/CGPA number
  // vs a First/Second/Third dropdown) - the previously entered value no longer applies either way.
  onGradingSystemChange(): void {
    this.form.patchValue({ result: null });
  }

  get f() {
    return this.form.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['maxlength']) return `${this.getFieldDisplayName(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${this.getFieldDisplayName(fieldName)} must be ${field.errors['min'].min} or greater`;
      if (field.errors['max']) return `${this.getFieldDisplayName(fieldName)} cannot exceed ${field.errors['max'].max}`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      degreeTitle: 'Degree Title',
      institution: 'Institution',
      educationLevel: 'Education Level',
      passingYear: 'Passing Year',
      gradingSystem: 'Grading System',
      result: 'Result',
      majorSubject: 'Major Subject',
    };
    return displayNames[fieldName] || fieldName;
  }

  startAdd(): void {
    this.editingId = null;
    this.formSubmitted = false;
    this.saveError = '';
    this.form.reset();
    this.showForm = true;
  }

  startEdit(item: ICandidateEducationResponse): void {
    this.editingId = item.candidateEducationId;
    this.formSubmitted = false;
    this.saveError = '';
    this.form.patchValue(item);
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.form.reset();
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.saveError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const request = this.form.getRawValue();

    const request$: Observable<ApiResponse<number | void>> = this.editingId
      ? this.candidateProfileService.updateEducation(this.editingId, request)
      : this.candidateProfileService.addEducation(request);

    request$.subscribe({
      next: (response) => {
        this.saving = false;
        if (response && !response.hasError) {
          this.showForm = false;
          this.form.reset();
          this.loadEducation();
          this.saved.emit();
        } else {
          this.saveError = response?.decentMessage || 'Failed to save education entry.';
        }
      },
      error: (error) => {
        this.saving = false;
        this.saveError = error?.error?.decentMessage || 'Failed to save education entry.';
      },
    });
  }

  delete(item: ICandidateEducationResponse): void {
    this.candidateProfileService.deleteEducation(item.candidateEducationId).subscribe({
      next: () => {
        this.loadEducation();
        this.saved.emit();
      },
      error: (error) => {
        console.error('Error deleting education entry:', error);
      },
    });
  }
}
