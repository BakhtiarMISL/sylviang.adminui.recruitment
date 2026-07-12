import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ICandidateSkillResponse, ISkillLibraryItemResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { ProficiencyLevelOptions } from './skills-section.component.constants';

@Component({
  selector: 'app-skills-section',
  standalone: false,
  templateUrl: './skills-section.component.html',
  styleUrl: './skills-section.component.scss',
})
export class SkillsSectionComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private candidateProfileService: CandidateProfileService,
  ) {
    this.form = this.fb.group({
      skillName: [null, [Validators.required, Validators.maxLength(100)]],
      skillLibraryItemId: [null],
      proficiencyLevel: [null],
    });
  }

  proficiencyLevelOptions = ProficiencyLevelOptions;
  form: FormGroup;
  formSubmitted = false;
  saving = false;
  saveError = '';

  items: ICandidateSkillResponse[] = [];
  loading = false;

  skillLibrary: ISkillLibraryItemResponse[] = [];
  skillSuggestions: ISkillLibraryItemResponse[] = [];

  // Best-effort skill names from a parsed resume (see MyProfileComponent.onResumeParsed).
  // Clicking a chip only fills the skillName input - nothing is saved until Add Skill is clicked.
  prefillSkillSuggestions: string[] = [];

  stagePrefill(skills: string[]): void {
    this.prefillSkillSuggestions = skills;
  }

  useSkillSuggestion(skill: string, index: number): void {
    this.form.patchValue({ skillName: skill, skillLibraryItemId: null });
    this.prefillSkillSuggestions = this.prefillSkillSuggestions.filter((_, i) => i !== index);
  }

  dismissSkillSuggestion(index: number): void {
    this.prefillSkillSuggestions = this.prefillSkillSuggestions.filter((_, i) => i !== index);
  }

  ngOnInit(): void {
    this.loadSkills();
    this.loadSkillLibrary();
  }

  loadSkills(): void {
    this.loading = true;
    this.candidateProfileService.getSkills().subscribe({
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

  loadSkillLibrary(): void {
    this.candidateProfileService.getSkillLibrary().subscribe({
      next: (response) => {
        this.skillLibrary = !response.hasError && response.content ? response.content : [];
      },
      error: () => {
        this.skillLibrary = [];
      },
    });
  }

  filterSkill(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim().toLowerCase();
    this.skillSuggestions = this.skillLibrary.filter((s) => s.name.toLowerCase().includes(query));
  }

  onSkillSelect(event: AutoCompleteSelectEvent): void {
    const selected = event.value as ISkillLibraryItemResponse;
    this.form.patchValue({ skillName: selected.name, skillLibraryItemId: selected.skillLibraryItemId });
  }

  // Typing free text (no library match) clears the library link — SkillLibraryItemId stays
  // null and the raw text is saved as-is, matching the "null = free text" data model decision.
  onSkillNameInput(): void {
    const currentName = this.form.get('skillName')?.value;
    const currentLinkedId = this.form.get('skillLibraryItemId')?.value;
    if (currentLinkedId) {
      const linked = this.skillLibrary.find((s) => s.skillLibraryItemId === currentLinkedId);
      if (!linked || linked.name !== currentName) {
        this.form.patchValue({ skillLibraryItemId: null }, { emitEvent: false });
      }
    }
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
      if (field.errors['required']) return 'Skill name is required';
      if (field.errors['maxlength']) return `Skill name cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.saveError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.candidateProfileService.addSkill(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.saving = false;
        if (response && !response.hasError) {
          this.form.reset();
          this.formSubmitted = false;
          this.loadSkills();
          this.saved.emit();
        } else {
          this.saveError = response?.decentMessage || 'Failed to add skill.';
        }
      },
      error: (error) => {
        this.saving = false;
        this.saveError = error?.error?.decentMessage || 'Failed to add skill.';
      },
    });
  }

  delete(item: ICandidateSkillResponse): void {
    this.candidateProfileService.deleteSkill(item.candidateSkillId).subscribe({
      next: () => {
        this.loadSkills();
        this.saved.emit();
      },
      error: (error) => {
        console.error('Error deleting skill:', error);
      },
    });
  }
}
