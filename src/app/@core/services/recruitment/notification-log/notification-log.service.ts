import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { PaginatedResponse } from '@core/interfaces/PaginatedResponse';
import { DISABLE_TOAST } from '@core/constants/http-context';
import { INotificationLogFilterRequest, INotificationLogResponse } from '@core/interfaces/recruitment-management/notification-log.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationLogService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/notification-log';

  getAll(filter: INotificationLogFilterRequest) {
    return this.httpClient.get<ApiResponse<PaginatedResponse<INotificationLogResponse[]>>>(`${this.API_URL}`, {
      params: this.buildParams(filter),
    });
  }

  // Polled every 30s by the header bell - must never toast on transient failures.
  getUnread() {
    return this.httpClient.get<ApiResponse<INotificationLogResponse[]>>(`${this.API_URL}/unread`, {
      context: new HttpContext().set(DISABLE_TOAST, true),
    });
  }

  getUnreadCount() {
    return this.httpClient.get<ApiResponse<number>>(`${this.API_URL}/unread-count`, {
      context: new HttpContext().set(DISABLE_TOAST, true),
    });
  }

  exportExcel(filter: INotificationLogFilterRequest) {
    return this.httpClient.post(`${this.API_URL}/export-excel`, filter, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  retry(notificationLogId: number) {
    return this.httpClient.post<ApiResponse<INotificationLogResponse>>(`${this.API_URL}/${notificationLogId}/retry`, {});
  }

  markRead(notificationLogId: number) {
    return this.httpClient.post<ApiResponse<void>>(`${this.API_URL}/${notificationLogId}/mark-read`, {}, {
      context: new HttpContext().set(DISABLE_TOAST, true),
    });
  }

  markAllRead() {
    return this.httpClient.post<ApiResponse<number>>(`${this.API_URL}/mark-all-read`, {});
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
