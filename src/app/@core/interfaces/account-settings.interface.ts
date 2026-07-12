export interface IAccountSettingsResponse {
  email: string;
  profilePhotoPath?: string | null;
  role: string;
}

export interface IAccountEmailUpdateRequest {
  email: string;
}

export interface IAccountPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}
