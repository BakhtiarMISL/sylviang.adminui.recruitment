export interface ILoginResponse {
  token: string;
  expiresAtUtc: string;
  /** Absent for offline-fallback sessions - only Keycloak issues refresh tokens. */
  refreshToken?: string | null;
  username: string;
  displayName: string;
  role: string;
}
