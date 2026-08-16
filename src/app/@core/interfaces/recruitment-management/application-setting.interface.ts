export interface IApplicationSettingResponse {
  minimumProfileCompletenessPercentage: number;
  hrNotificationEmail: string | null;
}

export interface IApplicationSettingUpdateRequest {
  minimumProfileCompletenessPercentage: number;
}
