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
    // Public/anonymous endpoints (career portal) must be hit without auth — attaching a
    // stale/expired token here risks the backend rejecting a genuinely public request.
    if (!token || request.url.includes('/career-portal')) {
      return next.handle(request);
    }

    const authorizedRequest = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });

    return next.handle(authorizedRequest);
  }
}
