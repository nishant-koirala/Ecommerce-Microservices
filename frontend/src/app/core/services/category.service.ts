import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CategoryRequest, CategoryResponse } from '../models/product';

const API = `${environment.apiUrl}/api/v1`;

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);

  private readonly categories$: Observable<CategoryResponse[]> = this.http
    .get<CategoryResponse[]>(`${API}/categories`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getCategories(): Observable<CategoryResponse[]> {
    return this.categories$;
  }

  create(request: CategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(`${API}/categories`, request);
  }
}
