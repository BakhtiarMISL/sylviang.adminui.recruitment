import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from './header.component';
import { AuthService } from '@core/services/auth/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout', 'getUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: BreadcrumbService, useValue: { breadcrumbs$: of([]) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    component = TestBed.createComponent(HeaderComponent).componentInstance;
  });

  it('should show the authenticated user display name', () => {
    authServiceSpy.getUser.and.returnValue({ username: 'admin', displayName: 'Administrator', role: 'Admin' } as any);

    expect(component.displayName).toBe('Administrator');
  });

  it('should fall back to "User" when nobody is authenticated', () => {
    authServiceSpy.getUser.and.returnValue(null);

    expect(component.displayName).toBe('User');
  });

  it('logout() should clear the session and navigate to /login', () => {
    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
