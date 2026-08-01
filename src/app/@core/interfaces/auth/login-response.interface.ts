export interface ILoginResponse {
  token: string;
  expiresAtUtc: string;
  /** Absent for offline-fallback sessions - only Keycloak issues refresh tokens. */
  refreshToken?: string | null;
  username: string;
  displayName: string;
  role: string;
  /** EP-09 Feature 2: true when token/refreshToken are withheld pending OTP verification
   * (candidate login only, gate enabled). False - the default - for every other login. */
  requiresOtp?: boolean;
  /** Opaque id to pass to verify-otp/resend-otp. Only set when requiresOtp is true. */
  challengeId?: string;
  /** When the current OTP code expires (UTC ISO string). Only set when requiresOtp is true. */
  otpExpiresAtUtc?: string;
}
