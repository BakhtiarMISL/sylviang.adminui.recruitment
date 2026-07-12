export interface ILoginResponse {
  token: string;
  expiresAtUtc: string;
  username: string;
  displayName: string;
  role: string;
}
