export interface IImpersonationStartRequest {
  targetUserAccountId: number;
}

export interface IImpersonationStartResponse {
  impersonationSessionId: number;
  token: string;
  expiresAtUtc: string;
  targetFullName: string;
  targetEmail: string;
  targetRole: string;
}
