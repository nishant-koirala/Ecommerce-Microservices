import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, take, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CategoryRequest, CategoryResponse } from '../models/product';

const API = `${environment.apiUrl}/api/v1`;

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);

  readonly categories = signal<CategoryResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly categories$: Observable<CategoryResponse[]> = this.http
    .get<CategoryResponse[]>(`${API}/categories`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getCategories(): Observable<CategoryResponse[]> {
    this.loading.set(true);
    return this.categories$.pipe(
      take(1),
      tap({
        next: (categories) => {
          this.categories.set(categories);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      }),
    );
  }

  refresh(): void {
    this.loading.set(true);
    this.categories$
      .pipe(take(1))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  create(request: CategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(`${API}/categories`, request);
  }

  update(id: number, request: CategoryRequest): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${API}/categories/${id}`, request);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/categories/${id}`);
  }
}
