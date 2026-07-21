import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import type { IMenuItem } from '@core/interfaces/menuResponse.interface';
import { webSidebarMenuItems } from '../constants/nav-menu-items';
import { AuthService } from '@core/services/auth/auth.service';
import { CandidateProfileService } from '@core/services/recruitment/candidate-profile/candidate-profile.service';
import { UserRoleEnum } from '@core/enums/user-role.enum';

const INTERNAL_JOB_BOARD_HREF = '/internal-jobs/job-list';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menuSubject = new BehaviorSubject<IMenuItem[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public menu$ = this.menuSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public user$ = new BehaviorSubject<any>(null).asObservable();

  constructor(
    private readonly _authService: AuthService,
    private readonly _candidateProfileService: CandidateProfileService,
  ) {
    this._authService.user$.subscribe(() => this.loadFallbackMenu());
  }

  private loadFallbackMenu(): void {
    const role = this._authService.getRole();
    const baseItems = this.filterByRole(webSidebarMenuItems, role);

    // Internal Job Board carries no `roles` restriction (Admin/HR/Candidate can all
    // legitimately browse it) - but a Candidate should only see it when their own
    // profile is internal (CandidateProfile.IsInternal), mirroring the backend's
    // CurrentUserMayViewInternalPostingsAsync check. Requires an extra call since
    // that flag isn't part of the auth token/role.
    if (role === UserRoleEnum.Candidate) {
      this._candidateProfileService.getMyProfile().subscribe({
        next: (response) => this.menuSubject.next(this.transformMenuItems(this.filterInternalJobBoard(baseItems, response.content?.isInternal ?? false))),
        error: () => this.menuSubject.next(this.transformMenuItems(this.filterInternalJobBoard(baseItems, false))),
      });
      return;
    }

    this.menuSubject.next(this.transformMenuItems(baseItems));
  }

  private filterInternalJobBoard(items: IMenuItem[], isInternal: boolean): IMenuItem[] {
    if (isInternal) return items;
    return items.filter((item) => item.href !== INTERNAL_JOB_BOARD_HREF);
  }

  /** Recursive so per-role restrictions on sub-items (not just top-level items) are actually enforced. */
  private filterByRole(items: IMenuItem[], role: ReturnType<AuthService['getRole']>): IMenuItem[] {
    return items
      .filter((item) => !item.roles || (role && item.roles.includes(role)))
      .map((item) => ({
        ...item,
        subItems: item.subItems ? this.filterByRole(item.subItems, role) : undefined,
      }));
  }

  private transformMenuItems(items: IMenuItem[]): IMenuItem[] {
    return items.map((item) => ({
      ...item,
      expanded: false,
      subItems: item.subItems ? this.transformMenuItems(item.subItems) : undefined,
    }));
  }

  getCurrentMenu(): IMenuItem[] {
    return this.menuSubject.value;
  }

  loadMenuIfNeeded(): Observable<IMenuItem[]> {
    return of(this.menuSubject.value);
  }

  refreshMenu(): Observable<IMenuItem[]> {
    this.loadFallbackMenu();
    return of(this.menuSubject.value);
  }

  updateActiveMenuItem(currentRoute: string): void {
    const menuItems = this.getCurrentMenu();
    const updatedMenuItems = this.updateMenuItemsActiveState(menuItems, currentRoute);
    this.menuSubject.next(updatedMenuItems);
  }

  private updateMenuItemsActiveState(items: IMenuItem[], currentRoute: string): IMenuItem[] {
    return items.map((item) => {
      const updatedItem: IMenuItem = { ...item };
      updatedItem.active = this.isRouteMatch(item.href, currentRoute);
      updatedItem.expanded = item.expanded || false;
      if (item.subItems && item.subItems.length > 0) {
        updatedItem.subItems = this.updateMenuItemsActiveState(item.subItems, currentRoute);
      }
      return updatedItem;
    });
  }

  private isRouteMatch(menuHref: string | undefined, currentRoute: string): boolean {
    if (!menuHref) return false;
    const normalizedMenuHref = menuHref.replace(/^\//, '');
    const normalizedCurrentRoute = currentRoute.replace(/^\//, '');
    return normalizedCurrentRoute === normalizedMenuHref || normalizedCurrentRoute.startsWith(normalizedMenuHref + '/');
  }
}
