import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  ICandidateEducationCreateRequest,
  ICandidateEducationResponse,
  ICandidateResumeParsedEducation,
  IDegreeResponse,
  IEducationBoardResponse,
  IUniversityLibraryItemResponse,
} from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { GradingSystemEnum } from '@app/@core/enums/recruitment.enum';
import { catchError, concatMap, from, Observable, of, toArray } from 'rxjs';
import { AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { DivisionResultOptions, EducationLevelOptions, GradingSystemOptions, GradingSystemScale } from './education-section.component.constants';

// Degrees whose Position is in this set are SSC/HSC-equivalent (see Degree.Position on the
// backend) - the Board dropdown only makes sense for those, matching the company's reference
// Millennium HR system where Board is tied to that same equivalence grouping.
const BOARD_APPLICABLE_POSITIONS = [1, 2];

// Minimum characters typed before the University autocomplete shows any suggestion.
const UNIVERSITY_MIN_QUERY_LENGTH = 3;

@Component({
  selector: 'app-education-section',
  standalone: false,
  templateUrl: './education-section.component.html',
  styleUrl: './education-section.component.scss',
})
export class EducationSectionComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();
  // Lets the parent persist the current (post-Use/Dismiss) suggestion list so a page refresh
  // can restore exactly what's left instead of resurrecting already-handled suggestions.
  @Output() suggestionsChanged = new EventEmitter<ICandidateResumeParsedEducation[]>();

  constructor(
    private fb: FormBuilder,
    private candidateProfileService: CandidateProfileService,
  ) {
    this.form = this.fb.group({
      degreeId: [null, [Validators.required]],
      educationBoardId: [null],
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

  degrees: IDegreeResponse[] = [];
  educationBoards: IEducationBoardResponse[] = [];

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
    const matchedDegree = this.matchDegree(suggestion.degreeTitle);
    this.form.patchValue({
      degreeId: matchedDegree?.degreeId ?? null,
      institution: suggestion.institution,
      educationLevel: suggestion.educationLevel ?? null,
      universityLibraryItemId: suggestion.universityLibraryItemId,
      passingYear: suggestion.passingYear,
      result: suggestion.result,
      majorSubject: suggestion.majorSubject,
    });
    this.prefillSuggestions = this.prefillSuggestions.filter((_, i) => i !== index);
    this.suggestionsChanged.emit(this.prefillSuggestions);
  }

  // Resume parsing only returns a free-text degree guess (e.g. "BSc in CSE") - Degree is now a
  // dynamic dropdown, so best-effort match it against the loaded Degree list by substring on
  // either side. No match means the candidate must pick the Degree manually before saving.
  private matchDegree(degreeTitle?: string | null): IDegreeResponse | undefined {
    if (!degreeTitle) return undefined;
    const text = degreeTitle.toLowerCase();
    return this.degrees.find((d) => text.includes(d.name.toLowerCase()) || text.includes(d.fullName.toLowerCase()));
  }

  dismissSuggestion(index: number): void {
    this.prefillSuggestions = this.prefillSuggestions.filter((_, i) => i !== index);
    this.suggestionsChanged.emit(this.prefillSuggestions);
  }

  isSuggestionReady(suggestion: ICandidateResumeParsedEducation): boolean {
    return !!(suggestion.degreeTitle && this.matchDegree(suggestion.degreeTitle) && suggestion.institution && suggestion.passingYear && suggestion.result);
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
            degreeId: this.matchDegree(suggestion.degreeTitle)!.degreeId,
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
        this.suggestionsChanged.emit(this.prefillSuggestions);
        this.loadEducation();
        this.saved.emit();
      });
  }

  showForm = false;

  ngOnInit(): void {
    this.loadEducation();
    this.loadUniversityLibrary();
    this.candidateProfileService.getDegrees().subscribe({
      next: (response) => (this.degrees = !response.hasError && response.content ? response.content : []),
    });
    this.candidateProfileService.getEducationBoards().subscribe({
      next: (response) => (this.educationBoards = !response.hasError && response.content ? response.content : []),
    });
  }

  degreeLabel(degreeId: number): string {
    return this.degrees.find((d) => d.degreeId === degreeId)?.name ?? '';
  }

  // Board only makes sense for SSC/HSC-equivalent degrees (see BOARD_APPLICABLE_POSITIONS).
  get showBoardField(): boolean {
    const degreeId = this.f['degreeId'].value;
    if (!degreeId) return false;
    const degree = this.degrees.find((d) => d.degreeId === degreeId);
    return !!degree && BOARD_APPLICABLE_POSITIONS.includes(degree.position);
  }

  onDegreeChange(): void {
    if (!this.showBoardField) {
      this.form.patchValue({ educationBoardId: null });
    }
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
    // Only start suggesting once the candidate has typed a few characters, rather than matching
    // on every single keystroke from the first letter.
    if (query.length < UNIVERSITY_MIN_QUERY_LENGTH) {
      this.universitySuggestions = [];
      return;
    }
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
    this.updateResultValidators();
  }

  // "out of 4.00" / "out of 5.00" hint next to the Result field - null for Division (dropdown,
  // no numeric scale) or when no grading system is selected yet.
  get resultScale(): number | null {
    const gradingSystem = this.f['gradingSystem'].value as GradingSystemEnum | null;
    return gradingSystem ? (GradingSystemScale[gradingSystem] ?? null) : null;
  }

  // Re-applies Result's validators to match the current grading system's scale (e.g. rejects a
  // CGPA above 4.00) - called whenever gradingSystem changes, including patching in an existing
  // entry to edit, since that doesn't fire the select's (onChange).
  private updateResultValidators(): void {
    const validators = [Validators.required, Validators.maxLength(50)];
    const scale = this.resultScale;
    if (scale) validators.push(this.resultScaleValidator(scale));
    const resultControl = this.form.get('result')!;
    resultControl.setValidators(validators);
    resultControl.updateValueAndValidity();
  }

  private resultScaleValidator(scale: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === '') return null;
      const value = parseFloat(control.value);
      if (isNaN(value)) return { invalidNumber: true };
      if (value < 0 || value > scale) return { maxScale: { max: scale } };
      return null;
    };
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
      if (field.errors['invalidNumber']) return `${this.getFieldDisplayName(fieldName)} must be a number`;
      if (field.errors['maxScale']) return `${this.getFieldDisplayName(fieldName)} cannot exceed ${field.errors['maxScale'].max.toFixed(2)}`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      degreeId: 'Degree',
      educationBoardId: 'Board',
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
    // form.reset() clears values but not a previously set() validator - a leftover CGPA/GPA
    // scale validator from editing another entry must not carry over to a fresh Add.
    this.updateResultValidators();
    this.showForm = true;
  }

  startEdit(item: ICandidateEducationResponse): void {
    this.editingId = item.candidateEducationId;
    this.formSubmitted = false;
    this.saveError = '';
    this.form.patchValue(item);
    this.updateResultValidators();
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
