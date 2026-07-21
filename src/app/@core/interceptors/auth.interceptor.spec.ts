import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth/auth.service';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should attach an Authorization header when a token is present', () => {
    authServiceSpy.getToken.and.returnValue('my-token');

    httpClient.get('/some/endpoint').subscribe();

    const req = httpMock.expectOne('/some/endpoint');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('should not attach an Authorization header when no token is present', () => {
    authServiceSpy.getToken.and.returnValue(null);

    httpClient.get('/some/endpoint').subscribe();

    const req = httpMock.expectOne('/some/endpoint');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
