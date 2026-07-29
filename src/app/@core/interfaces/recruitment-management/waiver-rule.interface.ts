/** EP-17/US-127: candidate-type criterion on a WaiverRule - keys off CandidateProfile.IsInternal,
 * not the application channel (ApplicationSourceEnum). */
export enum WaiverCandidateTypeEnum {
  Internal = 'Internal',
  External = 'External',
}

export interface IWaiverRuleResponse {
  waiverRuleId: number;
  name: string;
  description?: string | null;
  candidateTypeFilter?: WaiverCandidateTypeEnum | null;
  specialCategoryId?: number | null;
  specialCategoryName?: string | null;
  referralSourceId?: number | null;
  referralSourceName?: string | null;
  priority: number;
  isActive: boolean;
}

export interface IWaiverRuleRequest {
  name: string;
  description?: string | null;
  candidateTypeFilter?: WaiverCandidateTypeEnum | null;
  specialCategoryId?: number | null;
  referralSourceId?: number | null;
  priority: number;
  isActive: boolean;
}
