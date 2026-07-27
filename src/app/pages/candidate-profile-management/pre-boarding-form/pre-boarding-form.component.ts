import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BreadcrumbService } from '@app/@core/services';
import { PreBoardingCandidateService } from '@app/@core/services/recruitment/pre-boarding-candidate/pre-boarding-candidate.service';
import { PreBoardingSubmissionStatusEnum } from '@core/enums/recruitment.enum';
import { IPreBoardingSaveRequest, IPreBoardingSubmissionResponse } from '@core/interfaces/recruitment-management/pre-boarding.interface';

@Component({
  selector: 'app-pre-boarding-form',
  standalone: false,
  templateUrl: './pre-boarding-form.component.html',
  styleUrl: './pre-boarding-form.component.scss',
})
export class PreBoardingFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private preBoardingCandidateService: PreBoardingCandidateService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      emergencyContactName: [null, [Validators.required, Validators.maxLength(200)]],
      emergencyContactRelationship: [null, [Validators.required, Validators.maxLength(100)]],
      emergencyContactPhone: [null, [Validators.required, Validators.maxLength(20)]],
      insuranceProvider: [null, [Validators.maxLength(200)]],
      insurancePolicyNumber: [null, [Validators.maxLength(100)]],
      insuranceNotes: [null, [Validators.maxLength(1000)]],
      bankName: [null, [Validators.required, Validators.maxLength(200)]],
      bankBranch: [null, [Validators.maxLength(200)]],
      bankAccountName: [null, [Validators.required, Validators.maxLength(200)]],
      bankAccountNumber: [null, [Validators.required, Validators.maxLength(50)]],
      bankRoutingNumber: [null, [Validators.maxLength(50)]],
      nominees: this.fb.array([]),
    });
  }

  form: FormGroup;
  item: IPreBoardingSubmissionResponse | null = null;
  loading = false;
  saving = false;
  submitting = false;
  formSubmitted = false;
  loadError = '';
  saveError = '';
  submitError = '';
  savedNotice = false;

  get nominees(): FormArray {
    return this.form.get('nominees') as FormArray;
  }

  get isLocked(): boolean {
    // AC5: NeedsCorrection re-opens the form for edits, same as Draft.
    return this.item?.status === PreBoardingSubmissionStatusEnum.Submitted || this.item?.status === PreBoardingSubmissionStatusEnum.Approved;
  }

  get needsCorrection(): boolean {
    return this.item?.status === PreBoardingSubmissionStatusEnum.NeedsCorrection;
  }

  get nomineeShareTotal(): number {
    return this.nominees.controls.reduce((sum, c) => sum + (Number(c.get('sharePercentage')?.value) || 0), 0);
  }

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([{ title: 'Pre-Boarding', icon: 'fa-solid fa-clipboard-list', href: '' }]);
    this.load();
  }

  private newNomineeGroup(nominee?: { fullName: string; relationship: string; sharePercentage: number; contactPhone?: string | null; address?: string | null }) {
    return this.fb.group({
      fullName: [nominee?.fullName ?? null, [Validators.required, Validators.maxLength(200)]],
      relationship: [nominee?.relationship ?? null, [Validators.required, Validators.maxLength(100)]],
      sharePercentage: [nominee?.sharePercentage ?? null, [Validators.required, Validators.min(0), Validators.max(100)]],
      contactPhone: [nominee?.contactPhone ?? null, [Validators.maxLength(20)]],
      address: [nominee?.address ?? null, [Validators.maxLength(500)]],
    });
  }

  addNominee(): void {
    this.nominees.push(this.newNomineeGroup());
  }

  removeNominee(index: number): void {
    this.nominees.removeAt(index);
  }

  private load(): void {
    this.loading = true;
    this.loadError = '';
    this.preBoardingCandidateService.get().subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.hasError && response.content) {
          this.applyItem(response.content);
        } else {
          this.loadError = response.decentMessage || 'Failed to load pre-boarding data.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.loadError = error?.error?.decentMessage || 'Failed to load pre-boarding data.';
        this.cdr.detectChanges();
      },
    });
  }

  private applyItem(item: IPreBoardingSubmissionResponse): void {
    this.item = item;
    this.form.patchValue({
      emergencyContactName: item.emergencyContactName || null,
      emergencyContactRelationship: item.emergencyContactRelationship || null,
      emergencyContactPhone: item.emergencyContactPhone || null,
      insuranceProvider: item.insuranceProvider || null,
      insurancePolicyNumber: item.insurancePolicyNumber || null,
      insuranceNotes: item.insuranceNotes || null,
      bankName: item.bankName || null,
      bankBranch: item.bankBranch || null,
      bankAccountName: item.bankAccountName || null,
      bankAccountNumber: item.bankAccountNumber || null,
      bankRoutingNumber: item.bankRoutingNumber || null,
    });

    this.nominees.clear();
    (item.nominees || []).forEach((n) => this.nominees.push(this.newNomineeGroup(n)));

    if (this.isLocked) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  private buildRequest(): IPreBoardingSaveRequest {
    const value = this.form.getRawValue();
    return {
      ...value,
      nominees: value.nominees || [],
    };
  }

  saveDraft(): void {
    if (this.isLocked) return;

    this.saving = true;
    this.saveError = '';
    this.savedNotice = false;
    this.preBoardingCandidateService.saveDraft(this.buildRequest()).subscribe({
      next: (response) => {
        this.saving = false;
        if (!response.hasError && response.content) {
          this.applyItem(response.content);
          this.savedNotice = true;
        } else {
          this.saveError = response.decentMessage || 'Failed to save draft.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.saving = false;
        this.saveError = error?.error?.decentMessage || 'Failed to save draft.';
        this.cdr.detectChanges();
      },
    });
  }

  submit(): void {
    if (this.isLocked) return;

    this.formSubmitted = true;
    this.submitError = '';

    if (this.form.invalid || this.nominees.length === 0) {
      this.form.markAllAsTouched();
      this.submitError = 'Please complete all required fields and add at least one nominee before submitting.';
      return;
    }

    if (this.nomineeShareTotal !== 100) {
      this.submitError = 'Nominee share percentages must sum to 100.';
      return;
    }

    this.submitting = true;

    // Persist the latest form edits first, then lock the submission - the submit endpoint
    // validates against what's already saved, not the form's in-memory state.
    this.preBoardingCandidateService.saveDraft(this.buildRequest()).subscribe({
      next: (saveResponse) => {
        if (saveResponse.hasError) {
          this.submitting = false;
          this.submitError = saveResponse.decentMessage || 'Failed to save before submitting.';
          this.cdr.detectChanges();
          return;
        }

        this.preBoardingCandidateService.submit().subscribe({
          next: (response) => {
            this.submitting = false;
            if (!response.hasError && response.content) {
              this.applyItem(response.content);
            } else {
              this.submitError = response.decentMessage || 'Failed to submit pre-boarding form.';
            }
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.submitting = false;
            this.submitError = error?.error?.decentMessage || 'Failed to submit pre-boarding form.';
            this.cdr.detectChanges();
          },
        });
      },
      error: (error) => {
        this.submitting = false;
        this.submitError = error?.error?.decentMessage || 'Failed to save before submitting.';
        this.cdr.detectChanges();
      },
    });
  }

  hasError(control: string, index: number | null = null): boolean {
    const field = index === null ? this.form.get(control) : this.nominees.at(index).get(control);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }
}
