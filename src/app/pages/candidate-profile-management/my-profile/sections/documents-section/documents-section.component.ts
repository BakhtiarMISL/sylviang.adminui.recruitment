import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CandidateDocumentType, ICandidateDocumentResponse } from '@app/@core/interfaces/recruitment-management/candidate-profile.interface';
import { CandidateProfileService } from '@app/@core/services/recruitment/candidate-profile/candidate-profile.service';
import { Base_URL } from '@env/environment';
import { CandidateDocumentTypeOptions } from './documents-section.component.constants';

const DOCUMENT_ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
const DOCUMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

@Component({
  selector: 'app-documents-section',
  standalone: false,
  templateUrl: './documents-section.component.html',
  styleUrl: './documents-section.component.scss',
})
export class DocumentsSectionComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();

  constructor(private candidateProfileService: CandidateProfileService) {}

  documentTypeOptions = CandidateDocumentTypeOptions;
  selectedType: CandidateDocumentType = 'NID';
  selectedFile: File | null = null;
  fileError = '';
  uploading = false;

  items: ICandidateDocumentResponse[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.candidateProfileService.getDocuments().subscribe({
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError = '';
    this.selectedFile = null;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!DOCUMENT_ALLOWED_EXTENSIONS.includes(extension)) {
      this.fileError = `File must be one of: ${DOCUMENT_ALLOWED_EXTENSIONS.join(', ')}`;
      return;
    }

    if (file.size > DOCUMENT_MAX_SIZE_BYTES) {
      this.fileError = 'File size must not exceed 10MB';
      return;
    }

    this.selectedFile = file;
  }

  upload(): void {
    if (!this.selectedFile) {
      this.fileError = 'File is required';
      return;
    }

    this.uploading = true;
    this.candidateProfileService.uploadDocument(this.selectedType, this.selectedFile).subscribe({
      next: (response) => {
        this.uploading = false;
        if (response && !response.hasError) {
          this.selectedFile = null;
          this.loadDocuments();
          this.saved.emit();
        } else {
          this.fileError = response?.decentMessage || 'Failed to upload document';
        }
      },
      error: (error) => {
        this.uploading = false;
        this.fileError = error?.error?.decentMessage || 'Failed to upload document';
      },
    });
  }

  delete(item: ICandidateDocumentResponse): void {
    this.candidateProfileService.deleteDocument(item.candidateDocumentId).subscribe({
      next: () => {
        this.loadDocuments();
        this.saved.emit();
      },
      error: (error) => {
        console.error('Error deleting document:', error);
      },
    });
  }

  getDownloadUrl(item: ICandidateDocumentResponse): string {
    if (!item.downloadUrl) return '';
    return `${Base_URL}${item.downloadUrl.startsWith('/') ? '' : '/'}${item.downloadUrl}`;
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  getDocumentTypeLabel(type: CandidateDocumentType): string {
    return this.documentTypeOptions.find((o) => o.value === type)?.label || type;
  }
}
