import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICandidateProfileResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { DateTimeUtility } from '@app/@core/utils/date-time.utility';
import { BloodGroupOptions, GenderOptions, MaritalStatusOptions, NationalityOptions, ReligionOptions } from './personal-info-section.component.constants';

@Component({
  selector: 'app-personal-info-section',
  standalone: false,
  templateUrl: './personal-info-section.component.html',
  styleUrl: './personal-info-section.component.scss',
})
export class PersonalInfoSectionComponent implements OnChanges {
  @Input() profile!: ICandidateProfileResponse;
  @Output() saved = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private candidateProfileService: CandidateProfileService,
  ) {
    this.form = this.fb.group({
      fullName: [null, [Validators.required, Validators.maxLength(200)]],
      dateOfBirth: [null],
      gender: [null],
      nationalId: [null, [Validators.maxLength(50)]],
      fatherName: [null, [Validators.maxLength(200)]],
      motherName: [null, [Validators.maxLength(200)]],
      maritalStatus: [null],
      religion: [null],
      nationality: [null, [Validators.maxLength(100)]],
      bloodGroup: [null],
    });
  }

  genderOptions = GenderOptions;
  maritalStatusOptions = MaritalStatusOptions;
  religionOptions = ReligionOptions;
  bloodGroupOptions = BloodGroupOptions;
  nationalityOptions = NationalityOptions;

  form: FormGroup;
  formSubmitted = false;
  saving = false;
  saveError = '';
  saveSuccess = false;

  // Called explicitly from a resume upload action (MyProfileComponent), not from ngOnChanges -
  // an intentional "prefill from resume" action should override, even if the user has already
  // started editing here. Nothing is saved; the user still reviews and hits Save.
  applyPrefill(fullName?: string | null, dateOfBirth?: string | null, gender?: string | null, religion?: string | null, maritalStatus?: string | null): void {
    if (fullName) {
      this.form.patchValue({ fullName });
    }
    if (dateOfBirth) {
      this.form.patchValue({ dateOfBirth: new Date(dateOfBirth) });
    }
    if (gender) {
      this.form.patchValue({ gender });
    }
    if (religion) {
      this.form.patchValue({ religion });
    }
    if (maritalStatus) {
      this.form.patchValue({ maritalStatus });
    }
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
      gender: 'Gender',
      nationalId: 'National ID',
      fatherName: "Father's Name",
      motherName: "Mother's Name",
      maritalStatus: 'Marital Status',
      religion: 'Religion',
      nationality: 'Nationality',
      bloodGroup: 'Blood Group',
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
