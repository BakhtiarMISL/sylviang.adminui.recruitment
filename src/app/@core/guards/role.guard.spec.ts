import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RoleGuard } from './role.guard';
import { AuthService } from '@core/services/auth/auth.service';
import { UserRoleEnum } from '@core/enums/user-role.enum';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getRole']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    });

    guard = TestBed.inject(RoleGuard);
  });

  function routeWithRoles(roles?: UserRoleEnum[]): ActivatedRouteSnapshot {
    return { data: { roles } } as unknown as ActivatedRouteSnapshot;
  }

  it('should allow activation when the route has no role restriction', () => {
    expect(guard.canActivate(routeWithRoles(undefined))).toBeTrue();
  });

  it('should allow activation when the current role matches an allowed role', () => {
    authServiceSpy.getRole.and.returnValue(UserRoleEnum.HR);

    expect(guard.canActivate(routeWithRoles([UserRoleEnum.Admin, UserRoleEnum.HR]))).toBeTrue();
  });

  it('should redirect to /dashboard when the current role is not allowed', () => {
    authServiceSpy.getRole.and.returnValue(UserRoleEnum.Candidate);

    const result = guard.canActivate(routeWithRoles([UserRoleEnum.Admin, UserRoleEnum.HR]));

    expect(result instanceof UrlTree).toBeTrue();
    expect((result as UrlTree).toString()).toContain('/dashboard');
  });
});
