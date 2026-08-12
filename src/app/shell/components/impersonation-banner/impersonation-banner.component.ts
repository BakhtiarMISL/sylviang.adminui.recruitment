import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { ImpersonationService } from '@core/services/recruitment/impersonation/impersonation.service';

@Component({
  selector: 'app-impersonation-banner',
  standalone: false,
  templateUrl: './impersonation-banner.component.html',
  styleUrl: './impersonation-banner.component.scss',
})
export class ImpersonationBannerComponent implements OnInit, OnDestroy {
  constructor(
    private authService: AuthService,
    private impersonationService: ImpersonationService,
    private router: Router,
  ) {}

  targetFullName = '';
  remainingLabel = '';
  ending = false;

  private expiresAtMs = 0;
  // Tracks which impersonation session expiresAtMs/targetFullName were loaded from, so a
  // session that starts *after* this banner was already mounted (i.e. every real case - the
  // banner lives in the shell from login onward) gets picked up on the next tick instead of
  // ticking against the stale 0-default from ngOnInit, which reads as "already expired" and
  // immediately auto-restores the original session.
  private loadedSessionId: number | null = null;
  private tickHandle: ReturnType<typeof setInterval> | null = null;

  get isImpersonating(): boolean {
    return this.authService.isImpersonating();
  }

  ngOnInit(): void {
    this.tick();
    this.tickHandle = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.tickHandle) clearInterval(this.tickHandle);
  }

  private tick(): void {
    const info = this.authService.getImpersonationInfo();
    if (!info) {
      this.loadedSessionId = null;
      return;
    }

    if (info.sessionId !== this.loadedSessionId) {
      this.loadedSessionId = info.sessionId;
      this.targetFullName = info.targetFullName;
      this.expiresAtMs = new Date(info.expiresAtUtc).getTime();
    }

    const remainingMs = this.expiresAtMs - Date.now();
    if (remainingMs <= 0) {
      this.remainingLabel = '0:00';
      this.authService.restoreOriginalSession();
      this.router.navigate(['/dashboard']);
      return;
    }

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    this.remainingLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  endImpersonation(): void {
    this.ending = true;
    this.impersonationService.end().subscribe({
      next: () => {
        this.authService.restoreOriginalSession();
        this.ending = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        // Session likely already expired server-side - restore locally regardless, the
        // impersonation token is unusable either way.
        this.authService.restoreOriginalSession();
        this.ending = false;
        this.router.navigate(['/dashboard']);
      },
    });
  }
}
