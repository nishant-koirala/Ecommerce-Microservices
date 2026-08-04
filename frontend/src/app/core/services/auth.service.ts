import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, UpdateUserRequest, UserResponse } from '../models/auth';
import { StorageService } from '../utils/storage';
import { ToastService } from './toast.service';

const API = `${environment.apiUrl}/api/v1`;
const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly toast = inject(ToastService);

  readonly currentUser = signal<UserResponse | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  readonly displayName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}`.trim() : '';
  });

  constructor() {
    const token = this.storage.get(TOKEN_KEY);
    const user = this.storage.getObject<UserResponse>(USER_KEY);
    if (token && user) {
      this.currentUser.set(user);
    }
  }

  get token(): string | null {
    return this.storage.get(TOKEN_KEY);
  }

  login(credentials: LoginRequest): Observable<UserResponse> {
    return this.http.post<LoginResponse>(`${API}/auth/login`, credentials).pipe(
      switchMap((response) => {
        this.storage.set(TOKEN_KEY, response.token);
        // The JWT only carries email; fetch the full profile for id/role.
        return this.http.get<UserResponse>(
          `${API}/users/email/${encodeURIComponent(response.email)}`,
        );
      }),
      tap((user) => {
        this.currentUser.set(user);
        this.storage.setObject(USER_KEY, user);
        this.toast.success(`Welcome back, ${user.firstName}`);
      }),
    );
  }

  register(payload: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${API}/users`, payload);
  }

  logout(): void {
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(USER_KEY);
    this.currentUser.set(null);
    this.toast.info('Signed out');
  }

  /** Update the signed-in user's profile (name). 403 if the caller isn't the owner. */
  updateProfile(request: UpdateUserRequest): Observable<UserResponse> {
    const user = this.currentUser();
    if (!user) {
      return throwError(() => new Error('Not signed in'));
    }
    return this.http.put<UserResponse>(`${API}/users/${user.id}`, request).pipe(
      tap((updated) => {
        this.currentUser.set(updated);
        this.storage.setObject(USER_KEY, updated);
        this.toast.success('Profile updated');
      }),
    );
  }

  /** Re-fetch the current user profile (e.g. after app reload with a token). */
  refreshProfile(): Observable<UserResponse | null> {
    const email = this.currentUser()?.email;
    if (!email) {
      return new Observable<UserResponse | null>((subscriber) => {
        subscriber.next(null);
        subscriber.complete();
      });
    }
    return this.http
      .get<UserResponse>(`${API}/users/email/${encodeURIComponent(email)}`)
      .pipe(
        map((user) => {
          this.currentUser.set(user);
          this.storage.setObject(USER_KEY, user);
          return user;
        }),
      );
  }
}
