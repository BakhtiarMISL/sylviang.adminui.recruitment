export interface IQuestionGroupRequest {
  name: string;
  description?: string;
}

export interface IQuestionGroupResponse {
  questionGroupId: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface IQuestionGroupLookupResponse {
  questionGroupId: number;
  name: string;
}

export interface ISetActiveStatusRequest {
  isActive: boolean;
}
