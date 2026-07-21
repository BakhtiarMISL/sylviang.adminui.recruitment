import { ApplicationSourceEnum, ApplicationStatusEnum, EducationLevelEnum } from '@app/@core/enums/recruitment.enum';

/**
 * The same 12-property filter snapshot already round-tripped by
 * ats-dashboard.component.ts's saveFiltersToSession/restoreFiltersFromSession (US-050 AC5).
 */
export interface ISavedSearchFilterSnapshot {
  filterJobPostingId: number | null;
  filterStatus: ApplicationStatusEnum | null;
  filterSource: ApplicationSourceEnum | null;
  filterDateFrom: string | null;
  filterDateTo: string | null;
  filterMinEducationLevel: EducationLevelEnum | null;
  filterMinExperienceYears: number | null;
  filterMaxExperienceYears: number | null;
  filterSkills: string[];
  filterLocation: string | null;
  filterMinAge: number | null;
  filterMaxAge: number | null;
}

export interface ISavedSearchCreateRequest {
  name: string;
  isShared: boolean;
  filterJson: string;
}

export interface ISavedSearchUpdateRequest extends ISavedSearchCreateRequest {}

export interface ISavedSearchLookupResponse {
  savedSearchId: number;
  name: string;
  isShared: boolean;
  isOwner: boolean;
  filterJson: string;
}
