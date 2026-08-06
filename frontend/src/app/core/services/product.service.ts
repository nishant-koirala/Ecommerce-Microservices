import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ProductRequest, ProductResponse } from '../models/product';

const API = `${environment.apiUrl}/api/v1`;

export interface ProductQuery {
  search?: string;
  categoryId?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  getAll(query: ProductQuery = {}): Observable<ProductResponse[]> {
    let params = new HttpParams();
    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.categoryId != null) {
      params = params.set('categoryId', String(query.categoryId));
    }
    return this.http.get<ProductResponse[]>(`${API}/products`, { params });
  }

  getById(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${API}/products/${id}`);
  }

  create(request: ProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${API}/products`, request);
  }

  update(id: number, request: ProductRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${API}/products/${id}`, request);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/products/${id}`);
  }

  /** Cached catalog used to enrich cart items without repeated fetches. */
  private readonly catalog$: Observable<ProductResponse[]> = this.http
    .get<ProductResponse[]>(`${API}/products`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getCatalog(): Observable<ProductResponse[]> {
    return this.catalog$;
  }
}
