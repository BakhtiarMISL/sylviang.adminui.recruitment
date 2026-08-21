import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DISABLE_TOAST } from '@core/constants/http-context';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IAuthenticatedUser } from '@core/interfaces/auth/authenticated-user.interface';
import { ILoginRequest } from '@core/interfaces/auth/login-request.interface';
import { ILoginResponse } from '@core/interfaces/auth/login-response.interface';
import { IRegisterRequest } from '@core/interfaces/auth/register-request.interface';
import { IRegisterResponse } from '@core/interfaces/auth/register-response.interface';
import { IVerifyOtpRequest } from '@core/interfaces/auth/verify-otp-request.interface';
import { IResendOtpRequest } from '@core/interfaces/auth/resend-otp-request.interface';
import { IResendOtpResponse } from '@core/interfaces/auth/resend-otp-response.interface';
import { IForgotPasswordRequest } from '@core/interfaces/auth/forgot-password-request.interface';
import { IForgotPasswordResponse } from '@core/interfaces/auth/forgot-password-response.interface';
import { IResetPasswordRequest } from '@core/interfaces/auth/reset-password-request.interface';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { IImpersonationStartResponse } from '@core/interfaces/recruitment-management/impersonation.interface';
import { BASE_URL_Recruitment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const TOKEN_KEY = 'sylviang_auth_token';
const USER_KEY = 'sylviang_auth_user';
const REFRESH_TOKEN_KEY = 'sylviang_auth_refresh_token';
const EXPIRES_AT_KEY = 'sylviang_auth_expires_at';

// EP-15/US-115: while impersonating, the real SuperAdmin session is stashed here so End
// Impersonation can restore it exactly - the impersonation token itself carries no refresh
// token, so silent refresh is intentionally not scheduled for it (see startImpersonation).
const ORIGINAL_TOKEN_KEY = 'sylviang_auth_original_token';
const ORIGINAL_USER_KEY = 'sylviang_auth_original_user';
const ORIGINAL_REFRESH_TOKEN_KEY = 'sylviang_auth_original_refresh_token';
const ORIGINAL_EXPIRES_AT_KEY = 'sylviang_auth_original_expires_at';
const IMPERSONATION_INFO_KEY = 'sylviang_impersonation_info';

// Refresh this many ms before actual expiry, so a request in flight right at the boundary
// still lands within the token's validity instead of racing it.
const REFRESH_BUFFER_MS = 30_000;
// Keycloak refresh tokens are themselves time-boxed - if a session comes back from being
// asleep/backgrounded longer than this past its access-token expiry, don't bother trying to
// silently refresh; let the next API call 401 and force a clean re-login instead.
const MAX_STALE_REFRESH_MS = 5 * 60_000;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${BASE_URL_Recruitment}/auth`;

  private userSubject = new BehaviorSubject<IAuthenticatedUser | null>(this.readStoredUser());
  public user$ = this.userSubject.asObservable();

  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private httpClient: HttpClient) {
    this.scheduleRefreshFromStorage();
  }

  login(request: ILoginRequest): Observable<ApiResponse<ILoginResponse>> {
    return this.httpClient.post<ApiResponse<ILoginResponse>>(`${this.API_URL}/login`, request).pipe(
      tap((response) => {
        // EP-09 Feature 2: requiresOtp means there's nothing usable to persist yet - the real
        // token only arrives after verifyOtp() succeeds.
        if (response.content && !response.content.requiresOtp) {
          this.persistSession(response.content);
        }
      }),
    );
  }

  verifyOtp(request: IVerifyOtpRequest): Observable<ApiResponse<ILoginResponse>> {
    return this.httpClient.post<ApiResponse<ILoginResponse>>(`${this.API_URL}/verify-otp`, request).pipe(
      tap((response) => {
        if (response.content) {
          this.persistSession(response.content);
        }
      }),
    );
  }

  // Callers always show their own tailored success toast for this - let the interceptor's
  // generic decentMessage toast fire here too and it doubles up.
  resendOtp(request: IResendOtpRequest): Observable<ApiResponse<IResendOtpResponse>> {
    const context = new HttpContext().set(DISABLE_TOAST, true);
    return this.httpClient.post<ApiResponse<IResendOtpResponse>>(`${this.API_URL}/resend-otp`, request, { context });
  }

  register(request: IRegisterRequest): Observable<ApiResponse<IRegisterResponse>> {
    return this.httpClient.post<ApiResponse<IRegisterResponse>>(`${this.API_URL}/register`, request);
  }

  // Same reasoning as resendOtp: both call sites (initial request + resend) show their own
  // toast, so the interceptor's auto toast would stack a second, redundant one.
  forgotPassword(request: IForgotPasswordRequest): Observable<ApiResponse<IForgotPasswordResponse>> {
    const context = new HttpContext().set(DISABLE_TOAST, true);
    return this.httpClient.post<ApiResponse<IForgotPasswordResponse>>(`${this.API_URL}/forgot-password`, request, { context });
  }

  resetPassword(request: IResetPasswordRequest): Observable<ApiResponse<null>> {
    return this.httpClient.post<ApiResponse<null>>(`${this.API_URL}/reset-password`, request);
  }

  logout(): void {
    this.clearScheduledRefresh();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): IAuthenticatedUser | null {
    return this.userSubject.value;
  }

  getRole(): UserRoleEnum | null {
    return this.userSubject.value?.role ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ── Impersonation (EP-15/US-115) ────────────────────────────────────────

  /** Stashes the current (real) session and swaps the active one to the impersonation token. */
  startImpersonation(response: IImpersonationStartResponse): void {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    const currentUser = localStorage.getItem(USER_KEY);
    const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const currentExpiresAt = localStorage.getItem(EXPIRES_AT_KEY);

    if (currentToken) localStorage.setItem(ORIGINAL_TOKEN_KEY, currentToken);
    if (currentUser) localStorage.setItem(ORIGINAL_USER_KEY, currentUser);
    if (currentRefreshToken) localStorage.setItem(ORIGINAL_REFRESH_TOKEN_KEY, currentRefreshToken);
    if (currentExpiresAt) localStorage.setItem(ORIGINAL_EXPIRES_AT_KEY, currentExpiresAt);

    this.clearScheduledRefresh();

    const impersonatedUser: IAuthenticatedUser = {
      username: response.targetEmail,
      displayName: response.targetFullName,
      role: response.targetRole as UserRoleEnum,
    };

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(impersonatedUser));
    localStorage.setItem(EXPIRES_AT_KEY, response.expiresAtUtc);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.setItem(
      IMPERSONATION_INFO_KEY,
      JSON.stringify({ sessionId: response.impersonationSessionId, targetFullName: response.targetFullName, expiresAtUtc: response.expiresAtUtc }),
    );

    this.userSubject.next(impersonatedUser);
    // No scheduleRefresh call - the impersonation token has no refresh token by design
    // (30-minute hard cap, see ImpersonationService.StartAsync).
  }

  /** Restores the stashed real session after End Impersonation succeeds server-side. */
  restoreOriginalSession(): void {
    const originalToken = localStorage.getItem(ORIGINAL_TOKEN_KEY);
    const originalUser = localStorage.getItem(ORIGINAL_USER_KEY);
    const originalRefreshToken = localStorage.getItem(ORIGINAL_REFRESH_TOKEN_KEY);
    const originalExpiresAt = localStorage.getItem(ORIGINAL_EXPIRES_AT_KEY);

    localStorage.removeItem(ORIGINAL_TOKEN_KEY);
    localStorage.removeItem(ORIGINAL_USER_KEY);
    localStorage.removeItem(ORIGINAL_REFRESH_TOKEN_KEY);
    localStorage.removeItem(ORIGINAL_EXPIRES_AT_KEY);
    localStorage.removeItem(IMPERSONATION_INFO_KEY);

    if (!originalToken || !originalUser || !originalExpiresAt) {
      this.logout();
      return;
    }

    localStorage.setItem(TOKEN_KEY, originalToken);
    localStorage.setItem(USER_KEY, originalUser);
    localStorage.setItem(EXPIRES_AT_KEY, originalExpiresAt);
    if (originalRefreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, originalRefreshToken);
    }

    this.userSubject.next(JSON.parse(originalUser) as IAuthenticatedUser);
    this.scheduleRefresh(originalExpiresAt);
  }

  isImpersonating(): boolean {
    return !!localStorage.getItem(IMPERSONATION_INFO_KEY);
  }

  getImpersonationInfo(): { sessionId: number; targetFullName: string; expiresAtUtc: string } | null {
    const raw = localStorage.getItem(IMPERSONATION_INFO_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private persistSession(content: ILoginResponse): void {
    const user: IAuthenticatedUser = {
      username: content.username,
      displayName: content.displayName,
      role: content.role as UserRoleEnum,
    };

    localStorage.setItem(TOKEN_KEY, content.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(EXPIRES_AT_KEY, content.expiresAtUtc);

    if (content.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, content.refreshToken);
    } else {
      // Offline-fallback session - nothing to silently renew.
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    this.userSubject.next(user);
    this.scheduleRefresh(content.expiresAtUtc);
  }

  private readStoredUser(): IAuthenticatedUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as IAuthenticatedUser) : null;
    } catch {
      return null;
    }
  }

  // ── Silent refresh ─────────────────────────────────────────────────────

  private scheduleRefreshFromStorage(): void {
    const expiresAtUtc = localStorage.getItem(EXPIRES_AT_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!expiresAtUtc || !refreshToken) return;

    const msUntilExpiry = new Date(expiresAtUtc).getTime() - Date.now();

    // Already past expiry when the app loads (tab was asleep/closed) - only worth a silent
    // retry if it's not wildly stale; otherwise let the next API call 401 into a real login.
    if (msUntilExpiry < -MAX_STALE_REFRESH_MS) return;

    this.scheduleRefresh(expiresAtUtc);
  }

  private scheduleRefresh(expiresAtUtc: string): void {
    this.clearScheduledRefresh();

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return;

    const delay = Math.max(0, new Date(expiresAtUtc).getTime() - Date.now() - REFRESH_BUFFER_MS);

    this.refreshTimer = setTimeout(() => this.runScheduledRefresh(refreshToken), delay);
  }

  private runScheduledRefresh(refreshToken: string): void {
    // Silent/background call - the user took no action, so a "Request processed successfully"
    // toast popping up minutes later reads as unexplained noise (see error-handler.interceptor.ts).
    const context = new HttpContext().set(DISABLE_TOAST, true);
    this.httpClient.post<ApiResponse<ILoginResponse>>(`${this.API_URL}/refresh`, { refreshToken }, { context }).subscribe({
      next: (response) => {
        if (response?.content) {
          this.persistSession(response.content);
        } else {
          this.logout();
        }
      },
      // Refresh token itself expired/revoked - nothing left to do but sign out cleanly.
      error: () => this.logout(),
    });
  }

  private clearScheduledRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}
