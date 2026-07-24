import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IAuthenticatedUser } from '@core/interfaces/auth/authenticated-user.interface';
import { ILoginRequest } from '@core/interfaces/auth/login-request.interface';
import { ILoginResponse } from '@core/interfaces/auth/login-response.interface';
import { IRegisterRequest } from '@core/interfaces/auth/register-request.interface';
import { IRegisterResponse } from '@core/interfaces/auth/register-response.interface';
import { IVerifyOtpRequest } from '@core/interfaces/auth/verify-otp-request.interface';
import { IResendOtpRequest } from '@core/interfaces/auth/resend-otp-request.interface';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { BASE_URL_Recruitment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const TOKEN_KEY = 'sylviang_auth_token';
const USER_KEY = 'sylviang_auth_user';
const REFRESH_TOKEN_KEY = 'sylviang_auth_refresh_token';
const EXPIRES_AT_KEY = 'sylviang_auth_expires_at';

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

  resendOtp(request: IResendOtpRequest): Observable<ApiResponse<void>> {
    return this.httpClient.post<ApiResponse<void>>(`${this.API_URL}/resend-otp`, request);
  }

  register(request: IRegisterRequest): Observable<ApiResponse<IRegisterResponse>> {
    return this.httpClient.post<ApiResponse<IRegisterResponse>>(`${this.API_URL}/register`, request);
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
    this.httpClient.post<ApiResponse<ILoginResponse>>(`${this.API_URL}/refresh`, { refreshToken }).subscribe({
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
