import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { NotificationResponse } from '../models/notification';

const API = `${environment.apiUrl}/api/v1`;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);

  readonly unreadCount = signal(0);

  getByUser(userId: number): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${API}/notifications/user/${userId}`);
  }

  getById(id: number): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${API}/notifications/${id}`);
  }

  markAllAsRead(userId: number, context?: HttpContext): Observable<void> {
    return this.http.post<void>(`${API}/notifications/user/${userId}/read`, null, { context });
  }

  loadUnreadCount(userId: number): void {
    this.http.get<number>(`${API}/notifications/user/${userId}/unread-count`).subscribe({
      next: (count) => this.unreadCount.set(count),
      error: () => this.unreadCount.set(0),
    });
  }
}
