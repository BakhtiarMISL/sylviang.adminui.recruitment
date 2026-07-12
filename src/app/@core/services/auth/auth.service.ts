import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IAuthenticatedUser } from '@core/interfaces/auth/authenticated-user.interface';
import { ILoginRequest } from '@core/interfaces/auth/login-request.interface';
import { ILoginResponse } from '@core/interfaces/auth/login-response.interface';
import { IRegisterRequest } from '@core/interfaces/auth/register-request.interface';
import { IRegisterResponse } from '@core/interfaces/auth/register-response.interface';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { BASE_URL_Recruitment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const TOKEN_KEY = 'sylviang_auth_token';
const USER_KEY = 'sylviang_auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${BASE_URL_Recruitment}/auth`;

  private userSubject = new BehaviorSubject<IAuthenticatedUser | null>(this.readStoredUser());
  public user$ = this.userSubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  login(request: ILoginRequest): Observable<ApiResponse<ILoginResponse>> {
    return this.httpClient.post<ApiResponse<ILoginResponse>>(`${this.API_URL}/login`, request).pipe(
      tap((response) => {
        if (response.content) {
          this.persistSession(response.content);
        }
      }),
    );
  }

  register(request: IRegisterRequest): Observable<ApiResponse<IRegisterResponse>> {
    return this.httpClient.post<ApiResponse<IRegisterResponse>>(`${this.API_URL}/register`, request);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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
    this.userSubject.next(user);
  }

  private readStoredUser(): IAuthenticatedUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as IAuthenticatedUser) : null;
    } catch {
      return null;
    }
  }
}
