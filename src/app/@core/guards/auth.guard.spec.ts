import { TestBed } from '@angular/core/testing';
import { Route, Router, UrlSegment, UrlTree } from '@angular/router';
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

  describe('canActivate', () => {
    it('should allow activation when the user is authenticated', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);

      expect(guard.canActivate()).toBeTrue();
    });

    it('should redirect to /login with a returnUrl when not authenticated', () => {
      authServiceSpy.isAuthenticated.and.returnValue(false);
      spyOnProperty(router, 'url', 'get').and.returnValue('/dashboard');

      const result = guard.canActivate(null, { url: '/dashboard' } as any) as UrlTree;

      expect(result instanceof UrlTree).toBeTrue();
      expect(result.toString()).toContain('/login');
      expect(result.toString()).toContain('returnUrl');
    });
  });

  describe('canMatch', () => {
    it('should allow matching when the user is authenticated', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);

      expect(guard.canMatch({} as Route, [new UrlSegment('dashboard', {})])).toBeTrue();
    });

    it('should return false (not redirect) for the bare root URL when not authenticated, so the router falls through to the public landing page', () => {
      authServiceSpy.isAuthenticated.and.returnValue(false);

      expect(guard.canMatch({} as Route, [])).toBeFalse();
    });

    it('should redirect to /login with a returnUrl for a deep link when not authenticated', () => {
      authServiceSpy.isAuthenticated.and.returnValue(false);

      const result = guard.canMatch({} as Route, [new UrlSegment('dashboard', {})]) as UrlTree;

      expect(result instanceof UrlTree).toBeTrue();
      expect(result.toString()).toContain('/login');
      expect(result.toString()).toContain('returnUrl');
    });
  });
});
