export interface IResetPasswordRequest {
  challengeId: string;
  otpCode: string;
  newPassword: string;
}
