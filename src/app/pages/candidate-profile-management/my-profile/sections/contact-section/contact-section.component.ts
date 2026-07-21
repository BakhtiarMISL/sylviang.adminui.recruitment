import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICandidateProfileResponse, IDistrictResponse, IDivisionResponse, IThanaResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { MobileOperatorOptions, MobileOperatorPrefixes } from './contact-section.component.constants';

@Component({
  selector: 'app-contact-section',
  standalone: false,
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.scss',
})
export class ContactSectionComponent implements OnInit, OnChanges {
  @Input() profile!: ICandidateProfileResponse;
  @Output() saved = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private candidateProfileService: CandidateProfileService,
  ) {
    this.form = this.fb.group({
      email: [null, [Validators.required, Validators.email, Validators.maxLength(200)]],
      mobileOperator: [null],
      mobileNumber: [null, [Validators.pattern(/^[0-9]{8}$/)]],

      presentDivisionId: [null],
      presentDistrictId: [null],
      presentThanaId: [null],
      presentAddressDetail: [null, [Validators.maxLength(500)]],

      homeDivisionId: [null],
      homeDistrictId: [null],
      homeThanaId: [null],
      permanentAddressDetail: [null, [Validators.maxLength(500)]],
    });
  }

  form: FormGroup;
  formSubmitted = false;
  saving = false;
  saveError = '';
  saveSuccess = false;

  mobileOperatorOptions = MobileOperatorOptions;
  divisionOptions: IDivisionResponse[] = [];
  presentDistrictOptions: IDistrictResponse[] = [];
  presentThanaOptions: IThanaResponse[] = [];
  homeDistrictOptions: IDistrictResponse[] = [];
  homeThanaOptions: IThanaResponse[] = [];

  ngOnInit(): void {
    this.candidateProfileService.getDivisions().subscribe({
      next: (response) => {
        this.divisionOptions = !response.hasError && response.content ? response.content : [];
      },
    });
  }

  // See PersonalInfoSectionComponent.applyPrefill for why this bypasses the pristine guard.
  applyPrefill(email?: string | null, phone?: string | null): void {
    const patch: { email?: string; mobileNumber?: string } = {};
    if (email) patch.email = email;
    if (phone) patch.mobileNumber = phone.slice(-8);
    if (Object.keys(patch).length > 0) this.form.patchValue(patch);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Parent reloads the whole profile (a new object reference) whenever ANY section saves,
    // so this fires on saves from sibling sections too. Skip re-patching once the user has
    // started editing here, or an in-progress edit in this section would be silently wiped.
    if (changes['profile'] && this.profile && this.form.pristine) {
      this.form.patchValue({
        ...this.profile,
        mobileNumber: this.profile.phone ? this.profile.phone.slice(-8) : null,
      });

      if (this.profile.presentDivisionId) this.loadDistricts('present', this.profile.presentDivisionId);
      if (this.profile.presentDistrictId) this.loadThanas('present', this.profile.presentDistrictId);
      if (this.profile.homeDivisionId) this.loadDistricts('home', this.profile.homeDivisionId);
      if (this.profile.homeDistrictId) this.loadThanas('home', this.profile.homeDistrictId);
    }
  }

  get f() {
    return this.form.controls;
  }

  // Cascading selects: choosing a Division unlocks/populates District, choosing a District
  // unlocks/populates Thana. Changing an earlier level clears whatever was selected below it,
  // since the previous District/Thana choice may no longer belong to the new Division/District.
  onDivisionChange(section: 'present' | 'home', divisionId: number | null): void {
    if (section === 'present') {
      this.form.patchValue({ presentDistrictId: null, presentThanaId: null });
      this.presentThanaOptions = [];
      this.presentDistrictOptions = [];
    } else {
      this.form.patchValue({ homeDistrictId: null, homeThanaId: null });
      this.homeThanaOptions = [];
      this.homeDistrictOptions = [];
    }
    if (divisionId) this.loadDistricts(section, divisionId);
  }

  onDistrictChange(section: 'present' | 'home', districtId: number | null): void {
    if (section === 'present') {
      this.form.patchValue({ presentThanaId: null });
      this.presentThanaOptions = [];
    } else {
      this.form.patchValue({ homeThanaId: null });
      this.homeThanaOptions = [];
    }
    if (districtId) this.loadThanas(section, districtId);
  }

  private loadDistricts(section: 'present' | 'home', divisionId: number): void {
    this.candidateProfileService.getDistricts(divisionId).subscribe({
      next: (response) => {
        const districts = !response.hasError && response.content ? response.content : [];
        if (section === 'present') this.presentDistrictOptions = districts;
        else this.homeDistrictOptions = districts;
      },
    });
  }

  private loadThanas(section: 'present' | 'home', districtId: number): void {
    this.candidateProfileService.getThanas(districtId).subscribe({
      next: (response) => {
        const thanas = !response.hasError && response.content ? response.content : [];
        if (section === 'present') this.presentThanaOptions = thanas;
        else this.homeThanaOptions = thanas;
      },
    });
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
      if (field.errors['pattern']) return `${this.getFieldDisplayName(fieldName)} must be exactly 8 digits`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      email: 'Email',
      mobileNumber: 'Mobile number',
      presentAddressDetail: 'Present Address',
      permanentAddressDetail: 'Permanent Address',
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
    const prefix = formValue.mobileOperator ? MobileOperatorPrefixes[formValue.mobileOperator] : '';
    const request = {
      ...formValue,
      phone: formValue.mobileNumber ? `${prefix}${formValue.mobileNumber}` : null,
    };
    delete request.mobileNumber;

    this.saving = true;
    this.candidateProfileService.updateContact(request).subscribe({
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
