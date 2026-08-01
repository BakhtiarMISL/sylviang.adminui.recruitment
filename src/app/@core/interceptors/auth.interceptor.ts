import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    // The career-portal GET endpoints (browse/detail) are [AllowAnonymous] and must be
    // reachable without auth. But POST .../career-portal/job-postings/{id}/apply is
    // [Authorize(Roles = "Candidate")] - it needs the token to identify who's applying, so
    // it must NOT be swept into this exclusion just because the URL also contains
    // "/career-portal". Was previously stripping the token from every career-portal request
    // including apply, causing a logged-in candidate's own application submission to 401.
    const isPublicCareerPortalRequest = request.method === 'GET' && request.url.includes('/career-portal');
    if (!token || isPublicCareerPortalRequest) {
      return next.handle(request);
    }

    const authorizedRequest = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });

    return next.handle(authorizedRequest);
  }
}
