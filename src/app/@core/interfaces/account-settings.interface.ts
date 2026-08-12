export interface IAccountSettingsResponse {
  email: string;
  profilePhotoPath?: string | null;
  role: string;
}

export interface IAccountEmailChangeRequest {
  newEmail: string;
}

export interface IAccountEmailChangeChallengeResponse {
  challengeId: string;
  expiresAtUtc: string;
}

export interface IAccountEmailChangeConfirmRequest {
  challengeId: string;
  otpCode: string;
}

export interface IAccountPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}
