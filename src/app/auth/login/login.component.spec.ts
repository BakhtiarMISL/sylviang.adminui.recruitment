import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@core/services/misc/toast.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    component = TestBed.createComponent(LoginComponent).componentInstance;
  });

  it('should mark fields as touched and not call login when the form is invalid', () => {
    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.username?.touched).toBeTrue();
    expect(component.password?.touched).toBeTrue();
  });

  it('should call AuthService.login and navigate on success', () => {
    authServiceSpy.login.and.returnValue(
      of({ hasError: false, decentMessage: '', content: { token: 't', expiresAtUtc: '', username: 'admin', displayName: 'Administrator', role: 'Admin' } }),
    );
    component.form.setValue({ username: 'admin', password: 'admin123' });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ username: 'admin', password: 'admin123' });
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    expect(component.isSubmitting).toBeFalse();
  });

  it('should show an error toast when login fails', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({ error: { decentMessage: 'Invalid username or password.' } })));
    component.form.setValue({ username: 'admin', password: 'wrong' });

    component.onSubmit();

    expect(toastServiceSpy.error).toHaveBeenCalledWith({ detail: 'Invalid username or password.' });
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBeFalse();
  });
});
