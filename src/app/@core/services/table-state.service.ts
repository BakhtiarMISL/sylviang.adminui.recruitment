import { Injectable } from '@angular/core';

/**
 * Persists list table state (pagination + filters + sort) across
 * route navigations (edit -> save -> back to list).
 *
 * - Stored in sessionStorage so it survives page reload but not browser close.
 * - Keyed per list (e.g. 'exam-question-list'), so each table has isolated state.
 * - No effect on local vs production besides the storage isolation per origin.
 */
@Injectable({ providedIn: 'root' })
export class TableStateService {
  private readonly prefix = 'table-state:';

  save<T>(key: string, state: T): void {
    try {
      sessionStorage.setItem(this.prefix + key, JSON.stringify(state));
    } catch {}
  }

  load<T>(key: string): T | null {
    try {
      const raw = sessionStorage.getItem(this.prefix + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  clear(key: string): void {
    try {
      sessionStorage.removeItem(this.prefix + key);
    } catch {}
  }
}
