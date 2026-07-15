import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICandidateProfileResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';

@Component({
  selector: 'app-contact-section',
  standalone: false,
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.scss',
})
export class ContactSectionComponent implements OnChanges {
  @Input() profile!: ICandidateProfileResponse;
  @Output() saved = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private candidateProfileService: CandidateProfileService,
  ) {
    this.form = this.fb.group({
      email: [null, [Validators.required, Validators.email, Validators.maxLength(200)]],
      phone: [null, [Validators.maxLength(50)]],
      presentAddress: [null, [Validators.maxLength(500)]],
      permanentAddress: [null, [Validators.maxLength(500)]],
      sameAsPresent: [false],
    });

    this.form.get('presentAddress')!.valueChanges.subscribe((value) => {
      if (this.form.get('sameAsPresent')!.value) {
        this.form.get('permanentAddress')!.setValue(value, { emitEvent: false });
      }
    });

    this.form.get('sameAsPresent')!.valueChanges.subscribe((checked) => {
      const permanentAddress = this.form.get('permanentAddress')!;
      if (checked) {
        permanentAddress.setValue(this.form.get('presentAddress')!.value, { emitEvent: false });
        permanentAddress.disable({ emitEvent: false });
      } else {
        permanentAddress.enable({ emitEvent: false });
      }
    });
  }

  form: FormGroup;
  formSubmitted = false;
  saving = false;
  saveError = '';
  saveSuccess = false;

  // See PersonalInfoSectionComponent.applyPrefill for why this bypasses the pristine guard.
  applyPrefill(email?: string | null, phone?: string | null): void {
    const patch: { email?: string; phone?: string } = {};
    if (email) patch.email = email;
    if (phone) patch.phone = phone;
    if (Object.keys(patch).length > 0) this.form.patchValue(patch);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Parent reloads the whole profile (a new object reference) whenever ANY section saves,
    // so this fires on saves from sibling sections too. Skip re-patching once the user has
    // started editing here, or an in-progress edit in this section would be silently wiped.
    if (changes['profile'] && this.profile && this.form.pristine) {
      this.form.patchValue({ ...this.profile });
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
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['email']) return `${this.getFieldDisplayName(fieldName)} must be a valid email address`;
      if (field.errors['maxlength']) return `${this.getFieldDisplayName(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      email: 'Email',
      phone: 'Phone',
      presentAddress: 'Present Address',
      permanentAddress: 'Permanent Address',
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

    this.saving = true;
    this.candidateProfileService.updateContact(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.saving = false;
        if (response && !response.hasError) {
          this.saveSuccess = true;
          this.saved.emit();
        } else {
          this.saveError = response?.decentMessage || 'Failed to save contact info.';
        }
      },
      error: (error) => {
        this.saving = false;
        this.saveError = error?.error?.decentMessage || 'Failed to save contact info.';
      },
    });
  }
}
