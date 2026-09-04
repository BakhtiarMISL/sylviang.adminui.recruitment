import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IBloodGroupResponse,
  ICandidateProfileResponse,
  IGenderResponse,
  IMaritalStatusResponse,
  IReligionResponse,
} from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { DateTimeUtility } from '@app/@core/utils/date-time.utility';
import { NationalityOptions } from './personal-info-section.component.constants';

@Component({
  selector: 'app-personal-info-section',
  standalone: false,
  templateUrl: './personal-info-section.component.html',
  styleUrl: './personal-info-section.component.scss',
})
export class PersonalInfoSectionComponent implements OnInit, OnChanges {
  @Input() profile!: ICandidateProfileResponse;
  @Output() saved = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private candidateProfileService: CandidateProfileService,
  ) {
    this.form = this.fb.group({
      fullName: [null, [Validators.required, Validators.maxLength(200)]],
      dateOfBirth: [null],
      genderId: [null],
      nationalId: [null, [Validators.maxLength(50)]],
      fatherName: [null, [Validators.maxLength(200)]],
      motherName: [null, [Validators.maxLength(200)]],
      maritalStatusId: [null],
      religionId: [null],
      nationality: [null, [Validators.maxLength(100)]],
      bloodGroupId: [null],
    });
  }

  genderOptions: IGenderResponse[] = [];
  maritalStatusOptions: IMaritalStatusResponse[] = [];
  religionOptions: IReligionResponse[] = [];
  bloodGroupOptions: IBloodGroupResponse[] = [];
  nationalityOptions = NationalityOptions;

  ngOnInit(): void {
    this.candidateProfileService.getGenders().subscribe({
      next: (response) => (this.genderOptions = !response.hasError && response.content ? response.content : []),
    });
    this.candidateProfileService.getMaritalStatuses().subscribe({
      next: (response) => (this.maritalStatusOptions = !response.hasError && response.content ? response.content : []),
    });
    this.candidateProfileService.getReligions().subscribe({
      next: (response) => (this.religionOptions = !response.hasError && response.content ? response.content : []),
    });
    this.candidateProfileService.getBloodGroups().subscribe({
      next: (response) => (this.bloodGroupOptions = !response.hasError && response.content ? response.content : []),
    });
  }

  form: FormGroup;
  formSubmitted = false;
  saving = false;
  saveError = '';
  saveSuccess = false;

  // Called explicitly from a resume upload action (MyProfileComponent), not from ngOnChanges -
  // an intentional "prefill from resume" action should override, even if the user has already
  // started editing here. Nothing is saved; the user still reviews and hits Save.
  //
  // Resume parsing returns Gender/Religion/MaritalStatus as best-effort plain text (e.g. "Male"),
  // not an id - these are dynamic admin-managed dropdowns now, so match the guessed text against
  // whichever options have already loaded (case-insensitive) and only patch if found.
  applyPrefill(fullName?: string | null, dateOfBirth?: string | null, gender?: string | null, religion?: string | null, maritalStatus?: string | null): void {
    if (fullName) {
      this.form.patchValue({ fullName });
    }
    if (dateOfBirth) {
      this.form.patchValue({ dateOfBirth: new Date(dateOfBirth) });
    }
    const genderId = this.findIdByName(this.genderOptions, 'genderId', gender);
    if (genderId) this.form.patchValue({ genderId });

    const religionId = this.findIdByName(this.religionOptions, 'religionId', religion);
    if (religionId) this.form.patchValue({ religionId });

    const maritalStatusId = this.findIdByName(this.maritalStatusOptions, 'maritalStatusId', maritalStatus);
    if (maritalStatusId) this.form.patchValue({ maritalStatusId });
  }

  private findIdByName(options: { name: string }[], idField: string, name?: string | null): number | null {
    if (!name) return null;
    const match = options.find((o) => o.name?.toLowerCase() === name.toLowerCase());
    return match ? ((match as unknown as Record<string, number>)[idField] ?? null) : null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Parent reloads the whole profile (a new object reference) whenever ANY section saves,
    // so this fires on saves from sibling sections too. Skip re-patching once the user has
    // started editing here, or an in-progress edit in this section would be silently wiped.
    if (changes['profile'] && this.profile && this.form.pristine) {
      this.form.patchValue({
        ...this.profile,
        dateOfBirth: this.profile.dateOfBirth ? new Date(this.profile.dateOfBirth) : null,
      });
    }

    // US-003 AC4: National ID is part of the candidate's application-matching identity - once
    // they have a submitted application it locks (independent of the pristine guard above, which
    // only gates re-patch).
    if (changes['profile'] && this.profile) {
      this.form.get('nationalId')?.[this.profile.hasSubmittedApplication ? 'disable' : 'enable']({ emitEvent: false });
    }
  }

  get identityFieldsLocked(): boolean {
    return !!this.profile?.hasSubmittedApplication;
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

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      fullName: 'Full Name',
      dateOfBirth: 'Date of Birth',
      genderId: 'Gender',
      nationalId: 'National ID',
      fatherName: "Father's Name",
      motherName: "Mother's Name",
      maritalStatusId: 'Marital Status',
      religionId: 'Religion',
      nationality: 'Nationality',
      bloodGroupId: 'Blood Group',
    };
    return displayNames[fieldName] || fieldName;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.saveError = '';
    this.saveSuccess = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const request = {
      ...formValue,
      dateOfBirth: formValue.dateOfBirth ? DateTimeUtility.formatDateForAPI(formValue.dateOfBirth) : null,
    };

    this.saving = true;
    this.candidateProfileService.updatePersonalInfo(request).subscribe({
      next: (response) => {
        this.saving = false;
        if (response && !response.hasError) {
          this.saveSuccess = true;
          this.form.markAsPristine();
          this.saved.emit();
        } else {
          this.saveError = response?.decentMessage || 'Failed to save personal info.';
        }
      },
      error: (error) => {
        this.saving = false;
        this.saveError = error?.error?.decentMessage || 'Failed to save personal info.';
      },
    });
  }
}
