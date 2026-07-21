import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import {
  CandidateDocumentType,
  ICandidateCertificationResponse,
  ICandidateDocumentResponse,
  ICandidateProfileDetailResponse,
  ICandidateProfileHrNotesUpdateRequest,
  ICandidateProfileSummaryResponse,
  ICandidateResumeParseResponse,
  ICandidateEducationCreateRequest,
  ICandidateEducationResponse,
  ICandidateEducationUpdateRequest,
  ICandidateProfileContactUpdateRequest,
  ICandidateProfilePersonalInfoUpdateRequest,
  ICandidateProfileResponse,
  ICandidateSkillCreateRequest,
  ICandidateSkillResponse,
  ICandidateTagCreateRequest,
  ICandidateTagResponse,
  ICandidateWorkExperienceCreateRequest,
  ICandidateWorkExperienceResponse,
  ICandidateWorkExperienceUpdateRequest,
  IDistrictResponse,
  IDivisionResponse,
  ISkillLibraryItemResponse,
  IThanaResponse,
} from '@core/interfaces/recruitment-management/candidate-profile.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class CandidateProfileService {
  constructor(private httpClient: HttpClient) {}

  API_URL = `${BASE_URL_Recruitment}/candidate-profile`;

  getMyProfile() {
    return this.httpClient.get<ApiResponse<ICandidateProfileResponse>>(`${this.API_URL}/me`);
  }

  updatePersonalInfo(request: ICandidateProfilePersonalInfoUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/me/personal-info`, request);
  }

  updateContact(request: ICandidateProfileContactUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/me/contact`, request);
  }

  // ── Address lookup (Division -> District -> Thana cascade) ───────

  getDivisions() {
    return this.httpClient.get<ApiResponse<IDivisionResponse[]>>(`${BASE_URL_Recruitment}/address-lookup/divisions`);
  }

  getDistricts(divisionId: number) {
    return this.httpClient.get<ApiResponse<IDistrictResponse[]>>(`${BASE_URL_Recruitment}/address-lookup/districts`, { params: { divisionId } });
  }

  getThanas(districtId: number) {
    return this.httpClient.get<ApiResponse<IThanaResponse[]>>(`${BASE_URL_Recruitment}/address-lookup/thanas`, { params: { districtId } });
  }

  // ── Education ────────────────────────────────────────────────────

  getEducation() {
    return this.httpClient.get<ApiResponse<ICandidateEducationResponse[]>>(`${this.API_URL}/me/education`);
  }

  addEducation(request: ICandidateEducationCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}/me/education`, request);
  }

  updateEducation(id: number, request: ICandidateEducationUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/me/education/${id}`, request);
  }

  deleteEducation(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/me/education/${id}`);
  }

  // ── Work Experience ──────────────────────────────────────────────

  getWorkExperience() {
    return this.httpClient.get<ApiResponse<ICandidateWorkExperienceResponse[]>>(`${this.API_URL}/me/work-experience`);
  }

  addWorkExperience(request: ICandidateWorkExperienceCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}/me/work-experience`, request);
  }

  updateWorkExperience(id: number, request: ICandidateWorkExperienceUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/me/work-experience/${id}`, request);
  }

  deleteWorkExperience(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/me/work-experience/${id}`);
  }

  // ── Skills ───────────────────────────────────────────────────────

  getSkills() {
    return this.httpClient.get<ApiResponse<ICandidateSkillResponse[]>>(`${this.API_URL}/me/skills`);
  }

  addSkill(request: ICandidateSkillCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}/me/skills`, request);
  }

  deleteSkill(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/me/skills/${id}`);
  }

  getSkillLibrary() {
    return this.httpClient.get<ApiResponse<ISkillLibraryItemResponse[]>>(`${BASE_URL_Recruitment}/skill-library`);
  }

  // ── Certifications ───────────────────────────────────────────────

  getCertifications() {
    return this.httpClient.get<ApiResponse<ICandidateCertificationResponse[]>>(`${this.API_URL}/me/certifications`);
  }

  addCertification(request: { certificationName: string; issuingOrganization?: string | null; issueDate?: string | null; expiryDate?: string | null; credentialId?: string | null }, certificateFile: File | null) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}/me/certifications`, this.buildCertificationFormData(request, certificateFile));
  }

  updateCertification(
    id: number,
    request: { certificationName: string; issuingOrganization?: string | null; issueDate?: string | null; expiryDate?: string | null; credentialId?: string | null },
    certificateFile: File | null,
  ) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/me/certifications/${id}`, this.buildCertificationFormData(request, certificateFile));
  }

  deleteCertification(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/me/certifications/${id}`);
  }

  private buildCertificationFormData(
    request: { certificationName: string; issuingOrganization?: string | null; issueDate?: string | null; expiryDate?: string | null; credentialId?: string | null },
    certificateFile: File | null,
  ): FormData {
    const formData = new FormData();
    formData.append('certificationName', request.certificationName);
    if (request.issuingOrganization) formData.append('issuingOrganization', request.issuingOrganization);
    if (request.issueDate) formData.append('issueDate', request.issueDate);
    if (request.expiryDate) formData.append('expiryDate', request.expiryDate);
    if (request.credentialId) formData.append('credentialId', request.credentialId);
    if (certificateFile) formData.append('certificateFile', certificateFile, certificateFile.name);
    return formData;
  }

  // ── Photo ────────────────────────────────────────────────────────

  uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.httpClient.post<ApiResponse<string>>(`${this.API_URL}/me/photo`, formData);
  }

  deletePhoto() {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/me/photo`);
  }

  // ── Signature ────────────────────────────────────────────────────

  uploadSignature(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.httpClient.post<ApiResponse<string>>(`${this.API_URL}/me/signature`, formData);
  }

  deleteSignature() {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/me/signature`);
  }

  // ── Documents ────────────────────────────────────────────────────

  getDocuments() {
    return this.httpClient.get<ApiResponse<ICandidateDocumentResponse[]>>(`${this.API_URL}/me/documents`);
  }

  uploadDocument(documentType: CandidateDocumentType, file: File) {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file, file.name);
    return this.httpClient.post<ApiResponse<ICandidateDocumentResponse>>(`${this.API_URL}/me/documents`, formData);
  }

  updateDocument(id: number, documentType: CandidateDocumentType, file: File | null) {
    const formData = new FormData();
    formData.append('documentType', documentType);
    if (file) formData.append('file', file, file.name);
    return this.httpClient.put<ApiResponse<ICandidateDocumentResponse>>(`${this.API_URL}/me/documents/${id}`, formData);
  }

  deleteDocument(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/me/documents/${id}`);
  }

  // ── Resume parse (prefill only — nothing is saved by this call) ───

  parseResume(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.httpClient.post<ApiResponse<ICandidateResumeParseResponse>>(`${this.API_URL}/me/resume-parse`, formData);
  }

  // ── HR/Admin read-only candidate view (US-009) ────────────────────

  getPaged(params: any) {
    return this.httpClient.get<ApiResponse<PaginatedResponse<ICandidateProfileSummaryResponse[]>>>(`${this.API_URL}/paged`, { params });
  }

  getById(candidateProfileId: number) {
    return this.httpClient.get<ApiResponse<ICandidateProfileDetailResponse>>(`${this.API_URL}/${candidateProfileId}`);
  }

  updateHrNotes(candidateProfileId: number, request: ICandidateProfileHrNotesUpdateRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${candidateProfileId}/hr-notes`, request);
  }

  markInternal(candidateProfileId: number) {
    return this.httpClient.put<ApiResponse<void>>(`${this.API_URL}/${candidateProfileId}/mark-internal`, {});
  }

  // ── Tags (US-041, HR-only) ───────────────────────────────────────

  getTagSuggestions(search: string) {
    return this.httpClient.get<ApiResponse<string[]>>(`${this.API_URL}/tags/suggestions`, { params: { search } });
  }

  getTags(candidateProfileId: number) {
    return this.httpClient.get<ApiResponse<ICandidateTagResponse[]>>(`${this.API_URL}/${candidateProfileId}/tags`);
  }

  addTag(candidateProfileId: number, request: ICandidateTagCreateRequest) {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}/${candidateProfileId}/tags`, request);
  }

  deleteTag(candidateProfileId: number, candidateTagId: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.API_URL}/${candidateProfileId}/tags/${candidateTagId}`);
  }
}
