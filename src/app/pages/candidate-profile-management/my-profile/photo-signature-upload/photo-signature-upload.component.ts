import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICandidateProfileResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { Base_URL } from '@env/environment';

const PHOTO_SIGNATURE_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const PHOTO_SIGNATURE_MAX_SIZE_BYTES = 2 * 1024 * 1024;

@Component({
  selector: 'app-photo-signature-upload',
  standalone: false,
  templateUrl: './photo-signature-upload.component.html',
  styleUrl: './photo-signature-upload.component.scss',
})
export class PhotoSignatureUploadComponent {
  @Input() profile!: ICandidateProfileResponse;
  @Output() saved = new EventEmitter<void>();

  constructor(private candidateProfileService: CandidateProfileService) {}

  photoError = '';
  signatureError = '';
  uploadingPhoto = false;
  uploadingSignature = false;
  selectedPhotoName = '';
  selectedSignatureName = '';

  getPhotoUrl(): string {
    if (!this.profile?.profilePhotoPath) return '';
    return `${Base_URL}${this.profile.profilePhotoPath.startsWith('/') ? '' : '/'}${this.profile.profilePhotoPath}`;
  }

  getSignatureUrl(): string {
    if (!this.profile?.signaturePath) return '';
    return `${Base_URL}${this.profile.signaturePath.startsWith('/') ? '' : '/'}${this.profile.signaturePath}`;
  }

  private validateFile(file: File): string {
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!PHOTO_SIGNATURE_ALLOWED_EXTENSIONS.includes(extension)) {
      return `File must be one of: ${PHOTO_SIGNATURE_ALLOWED_EXTENSIONS.join(', ')}`;
    }
    if (file.size > PHOTO_SIGNATURE_MAX_SIZE_BYTES) {
      return 'File size must not exceed 2MB';
    }
    return '';
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photoError = '';
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const error = this.validateFile(file);
    if (error) {
      this.photoError = error;
      input.value = '';
      return;
    }

    this.selectedPhotoName = file.name;
    this.uploadingPhoto = true;
    this.candidateProfileService.uploadPhoto(file).subscribe({
      next: (response) => {
        this.uploadingPhoto = false;
        input.value = '';
        if (response && !response.hasError) {
          this.saved.emit();
        } else {
          this.photoError = response?.decentMessage || 'Failed to upload photo';
        }
      },
      error: (error) => {
        this.uploadingPhoto = false;
        input.value = '';
        this.photoError = error?.error?.decentMessage || 'Failed to upload photo';
      },
    });
  }

  deletePhoto(): void {
    this.candidateProfileService.deletePhoto().subscribe({
      next: () => this.saved.emit(),
      error: (error) => console.error('Error deleting photo:', error),
    });
  }

  onSignatureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.signatureError = '';
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const error = this.validateFile(file);
    if (error) {
      this.signatureError = error;
      input.value = '';
      return;
    }

    this.selectedSignatureName = file.name;
    this.uploadingSignature = true;
    this.candidateProfileService.uploadSignature(file).subscribe({
      next: (response) => {
        this.uploadingSignature = false;
        input.value = '';
        if (response && !response.hasError) {
          this.saved.emit();
        } else {
          this.signatureError = response?.decentMessage || 'Failed to upload signature';
        }
      },
      error: (error) => {
        this.uploadingSignature = false;
        input.value = '';
        this.signatureError = error?.error?.decentMessage || 'Failed to upload signature';
      },
    });
  }

  deleteSignature(): void {
    this.candidateProfileService.deleteSignature().subscribe({
      next: () => this.saved.emit(),
      error: (error) => console.error('Error deleting signature:', error),
    });
  }
}
