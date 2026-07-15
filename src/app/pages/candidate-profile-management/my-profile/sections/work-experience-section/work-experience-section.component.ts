import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import {
  ICandidateResumeParsedWorkExperience,
  ICandidateWorkExperienceCreateRequest,
  ICandidateWorkExperienceResponse,
} from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { DateTimeUtility } from '@app/@core/utils/date-time.utility';
import { catchError, concatMap, from, Observable, of, toArray } from 'rxjs';

@Component({
  selector: 'app-work-experience-section',
  standalone: false,
  templateUrl: './work-experience-section.component.html',
  styleUrl: './work-experience-section.component.scss',
})
export class WorkExperienceSectionComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private candidateProfileService: CandidateProfileService,
  ) {
    this.form = this.fb.group({
      companyName: [null, [Validators.required, Validators.maxLength(200)]],
      designation: [null, [Validators.required, Validators.maxLength(200)]],
      startDate: [null, [Validators.required]],
      endDate: [null],
      isCurrent: [false],
      responsibilities: [null, [Validators.required]],
      location: [null, [Validators.maxLength(200)]],
    });

    this.form.addValidators(this.endDateValidator.bind(this));
  }

  form: FormGroup;
  formSubmitted = false;
  saving = false;
  saveError = '';

  items: ICandidateWorkExperienceResponse[] = [];
  loading = false;
  editingId: number | null = null;
  showForm = false;

  // Best-effort suggestions from a parsed resume (see MyProfileComponent.onResumeParsed).
  // Nothing here is saved automatically - clicking "Use" only opens the add form pre-filled
  // so the candidate reviews/completes (start date, responsibilities) and hits Save themselves.
  prefillSuggestions: ICandidateResumeParsedWorkExperience[] = [];
  savingAll = false;

  stagePrefill(suggestions: ICandidateResumeParsedWorkExperience[]): void {
    this.prefillSuggestions = suggestions;
  }

  useSuggestion(suggestion: ICandidateResumeParsedWorkExperience, index: number): void {
    this.startAdd();
    this.form.patchValue({
      companyName: suggestion.companyName,
      designation: suggestion.designation,
      startDate: suggestion.startDate ? new Date(suggestion.startDate) : null,
      endDate: !suggestion.isCurrent && suggestion.endDate ? new Date(suggestion.endDate) : null,
      isCurrent: !!suggestion.isCurrent,
      responsibilities: suggestion.responsibilities,
      location: suggestion.location,
    });
    this.prefillSuggestions = this.prefillSuggestions.filter((_, i) => i !== index);
  }

  dismissSuggestion(index: number): void {
    this.prefillSuggestions = this.prefillSuggestions.filter((_, i) => i !== index);
  }

  isSuggestionReady(suggestion: ICandidateResumeParsedWorkExperience): boolean {
    return !!(suggestion.companyName && suggestion.designation && suggestion.startDate && suggestion.responsibilities);
  }

  hasReadySuggestions(): boolean {
    return this.prefillSuggestions.some((s) => this.isSuggestionReady(s));
  }

  // Bulk-saves every "ready" suggestion directly (see EducationSectionComponent.useAllSuggestions
  // for the same pattern/rationale). endDate is forced null whenever isCurrent is true so a
  // suggestion with an inconsistent isCurrent/endDate combination can't trip endDateValidator.
  useAllSuggestions(): void {
    const ready = this.prefillSuggestions.filter((s) => this.isSuggestionReady(s));
    if (ready.length === 0) return;

    this.savingAll = true;
    from(ready)
      .pipe(
        concatMap((suggestion) => {
          const isCurrent = !!suggestion.isCurrent;
          const request: ICandidateWorkExperienceCreateRequest = {
            companyName: suggestion.companyName!,
            designation: suggestion.designation!,
            startDate: suggestion.startDate!,
            endDate: isCurrent ? null : (suggestion.endDate ?? null),
            isCurrent,
            responsibilities: suggestion.responsibilities!,
            location: suggestion.location ?? null,
          };
          return this.candidateProfileService.addWorkExperience(request).pipe(
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
        this.loadWorkExperience();
        this.saved.emit();
      });
  }

  ngOnInit(): void {
    this.loadWorkExperience();
  }

  loadWorkExperience(): void {
    this.loading = true;
    this.candidateProfileService.getWorkExperience().subscribe({
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

  private endDateValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup;
    const startDate = form.get('startDate')?.value;
    const endDate = form.get('endDate')?.value;
    const isCurrent = form.get('isCurrent')?.value;

    if (isCurrent && endDate) return { endDateNotAllowedWhenCurrent: true };
    if (!isCurrent && startDate && endDate && new Date(endDate) <= new Date(startDate)) return { endDateBeforeStartDate: true };
    return null;
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
    }
    return '';
  }

  getFormErrorMessage(): string {
    if (this.form.errors?.['endDateNotAllowedWhenCurrent']) return 'End date must be empty when currently working here';
    if (this.form.errors?.['endDateBeforeStartDate']) return 'End date must be after start date';
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      companyName: 'Company Name',
      designation: 'Designation',
      startDate: 'Start Date',
      endDate: 'End Date',
      responsibilities: 'Responsibilities',
      location: 'Location',
    };
    return displayNames[fieldName] || fieldName;
  }

  startAdd(): void {
    this.editingId = null;
    this.formSubmitted = false;
    this.saveError = '';
    this.form.reset({ isCurrent: false });
    this.showForm = true;
  }

  startEdit(item: ICandidateWorkExperienceResponse): void {
    this.editingId = item.candidateWorkExperienceId;
    this.formSubmitted = false;
    this.saveError = '';
    this.form.patchValue({
      ...item,
      startDate: item.startDate ? new Date(item.startDate) : null,
      endDate: item.endDate ? new Date(item.endDate) : null,
    });
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
    const formValue = this.form.getRawValue();
    const request = {
      ...formValue,
      startDate: DateTimeUtility.formatDateForAPI(formValue.startDate),
      endDate: formValue.endDate ? DateTimeUtility.formatDateForAPI(formValue.endDate) : null,
    };

    const request$: Observable<ApiResponse<number | void>> = this.editingId
      ? this.candidateProfileService.updateWorkExperience(this.editingId, request)
      : this.candidateProfileService.addWorkExperience(request);

    request$.subscribe({
      next: (response) => {
        this.saving = false;
        if (response && !response.hasError) {
          this.showForm = false;
          this.form.reset();
          this.loadWorkExperience();
          this.saved.emit();
        } else {
          this.saveError = response?.decentMessage || 'Failed to save work experience entry.';
        }
      },
      error: (error) => {
        this.saving = false;
        this.saveError = error?.error?.decentMessage || 'Failed to save work experience entry.';
      },
    });
  }

  delete(item: ICandidateWorkExperienceResponse): void {
    this.candidateProfileService.deleteWorkExperience(item.candidateWorkExperienceId).subscribe({
      next: () => {
        this.loadWorkExperience();
        this.saved.emit();
      },
      error: (error) => {
        console.error('Error deleting work experience entry:', error);
      },
    });
  }
}
