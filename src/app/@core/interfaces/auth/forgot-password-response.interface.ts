export interface IForgotPasswordResponse {
  challengeId: string;
  /** When the OTP code expires (UTC ISO string). */
  expiresAtUtc: string;
}
