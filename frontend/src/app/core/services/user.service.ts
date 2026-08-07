import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserResponse } from '../models/auth';

const API = `${environment.apiUrl}/api/v1`;

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  /** All registered users. Intended for the admin console (any JWT can call it). */
  getAll(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${API}/users`);
  }
}
