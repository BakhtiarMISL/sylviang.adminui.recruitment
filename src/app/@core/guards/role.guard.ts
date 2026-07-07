import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { UserRoleEnum } from '@core/enums/user-role.enum';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const allowedRoles = route.data?.['roles'] as UserRoleEnum[] | undefined;
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const currentRole = this.authService.getRole();
    if (currentRole && allowedRoles.includes(currentRole)) {
      return true;
    }

    return this.router.createUrlTree(['/dashboard']);
  }
}
