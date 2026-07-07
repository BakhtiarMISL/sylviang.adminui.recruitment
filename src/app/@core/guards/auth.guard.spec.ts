import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '@core/services/auth/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('should allow activation when the user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    expect(guard.canActivate()).toBeTrue();
  });

  it('should redirect to /login with a returnUrl when not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    spyOnProperty(router, 'url', 'get').and.returnValue('/dashboard');

    const result = guard.canActivate() as UrlTree;

    expect(result instanceof UrlTree).toBeTrue();
    expect(result.toString()).toContain('/login');
    expect(result.toString()).toContain('returnUrl');
  });
});
