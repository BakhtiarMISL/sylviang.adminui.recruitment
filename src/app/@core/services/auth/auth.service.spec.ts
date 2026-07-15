import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { BASE_URL_Recruitment } from '@env/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should start unauthenticated when no session is stored', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getUser()).toBeNull();
    expect(service.getRole()).toBeNull();
  });

  it('login() success should persist the token and user to localStorage', () => {
    service.login({ username: 'admin', password: 'admin123' }).subscribe();

    const req = httpMock.expectOne(`${BASE_URL_Recruitment}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({
      hasError: false,
      decentMessage: 'Request processed successfully.',
      content: {
        token: 'fake-token',
        expiresAtUtc: new Date().toISOString(),
        username: 'admin',
        displayName: 'Administrator',
        role: 'Admin',
      },
    });

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getToken()).toBe('fake-token');
    expect(service.getRole()).toBe(UserRoleEnum.Admin);
    expect(service.getUser()?.displayName).toBe('Administrator');
  });

  it('login() failure should surface the error and not persist any session', () => {
    let caughtError: unknown;

    service.login({ username: 'admin', password: 'wrong' }).subscribe({
      next: () => fail('expected an error'),
      error: (err) => (caughtError = err),
    });

    const req = httpMock.expectOne(`${BASE_URL_Recruitment}/auth/login`);
    req.flush(
      { hasError: true, decentMessage: 'Invalid username or password.', content: null },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(caughtError).toBeTruthy();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('logout() should clear the stored session', () => {
    service.login({ username: 'admin', password: 'admin123' }).subscribe();
    httpMock.expectOne(`${BASE_URL_Recruitment}/auth/login`).flush({
      hasError: false,
      decentMessage: '',
      content: { token: 'fake-token', expiresAtUtc: '', username: 'admin', displayName: 'Administrator', role: 'Admin' },
    });

    expect(service.isAuthenticated()).toBeTrue();

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getUser()).toBeNull();
  });
});
