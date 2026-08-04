import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { NotificationResponse } from '../models/notification';

const API = `${environment.apiUrl}/api/v1`;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);

  getByUser(userId: number): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${API}/notifications/user/${userId}`);
  }

  getById(id: number): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${API}/notifications/${id}`);
  }
}
