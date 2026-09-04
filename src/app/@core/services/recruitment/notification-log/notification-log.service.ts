import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import { DISABLE_TOAST } from '@core/constants/http-context';
import { INotificationLogFilterRequest, INotificationLogResponse } from '@core/interfaces/recruitment-management/notification-log.interface';
import { AuthService } from '@core/services/auth/auth.service';
import { UserRoleEnum } from '@core/enums/user-role.enum';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationLogService {
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
  ) {}

  // Admin/HR see every AdminHr-scoped row (their own management view: filter/export/retry);
  // Candidates only get the bell subset (unread/unread-count/mark-read/mark-all-read), scoped to
  // their own applications server-side - see CandidateNotificationLogController.
  private get baseUrl(): string {
    return this.authService.getRole() === UserRoleEnum.Candidate
      ? `${BASE_URL_Recruitment}/candidate-notification-log`
      : `${BASE_URL_Recruitment}/notification-log`;
  }

  getAll(filter: INotificationLogFilterRequest) {
    return this.httpClient.get<ApiResponse<PaginatedResponse<INotificationLogResponse[]>>>(`${this.baseUrl}`, {
      params: this.buildParams(filter),
    });
  }

  // Polled every 30s by the header bell - must never toast on transient failures.
  getUnread() {
    return this.httpClient.get<ApiResponse<INotificationLogResponse[]>>(`${this.baseUrl}/unread`, {
      context: new HttpContext().set(DISABLE_TOAST, true),
    });
  }

  getUnreadCount() {
    return this.httpClient.get<ApiResponse<number>>(`${this.baseUrl}/unread-count`, {
      context: new HttpContext().set(DISABLE_TOAST, true),
    });
  }

  exportExcel(filter: INotificationLogFilterRequest) {
    return this.httpClient.post(`${this.baseUrl}/export-excel`, filter, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  retry(notificationLogId: number) {
    return this.httpClient.post<ApiResponse<INotificationLogResponse>>(`${this.baseUrl}/${notificationLogId}/retry`, {});
  }

  markRead(notificationLogId: number) {
    return this.httpClient.post<ApiResponse<void>>(`${this.baseUrl}/${notificationLogId}/mark-read`, {}, {
      context: new HttpContext().set(DISABLE_TOAST, true),
    });
  }

  markAllRead() {
    return this.httpClient.post<ApiResponse<number>>(`${this.baseUrl}/mark-all-read`, {});
  }

  private buildParams(filter: INotificationLogFilterRequest): HttpParams {
    let params = new HttpParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
