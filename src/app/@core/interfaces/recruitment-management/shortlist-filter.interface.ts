import { CriterionTypeEnum, EducationLevelEnum, FilterCombinatorEnum } from '@app/@core/enums/recruitment.enum';

export interface IShortlistFilterCriterion {
  shortlistFilterCriterionId?: number;
  criterionType: CriterionTypeEnum;
  displayOrder: number;
  minEducationLevel?: EducationLevelEnum;
  minExperienceYears?: number;
  requiredSkillNames?: string;
  minAge?: number;
  maxAge?: number;
  requiredDistrict?: string;
  minScreeningScore?: number;

  /**
   * UI-only cache of requiredSkillNames split into an array, for p-multiSelect binding.
   * Never read on the backend (unrecognized fields are ignored on deserialize) - kept as a
   * stable array reference so [(ngModel)] doesn't re-render on every change-detection pass
   * the way re-deriving it from requiredSkillNames in the template would.
   */
  selectedSkills?: string[];
}

export interface IShortlistFilterCreateRequest {
  name: string;
  description?: string;
  combineWith: FilterCombinatorEnum;
  criteria: IShortlistFilterCriterion[];
}

export interface IShortlistFilterUpdateRequest extends IShortlistFilterCreateRequest {}

export interface IShortlistFilterResponse {
  shortlistFilterId: number;
  name: string;
  description?: string;
  isActive: boolean;
  combineWith: FilterCombinatorEnum;
  criteria: IShortlistFilterCriterion[];
}

export interface IShortlistFilterLookupResponse {
  shortlistFilterId: number;
  name: string;
}

export interface IShortlistFilterDefinition {
  combineWith: FilterCombinatorEnum;
  criteria: IShortlistFilterCriterion[];
}

export interface IShortlistFilterPreviewRequest {
  shortlistFilterId?: number;
  definition?: IShortlistFilterDefinition;
  jobPostingId: number;
}

export interface IShortlistFilterPreviewResponse {
  totalApplications: number;
  passingCount: number;
  passingJobApplicationIds: number[];
}
