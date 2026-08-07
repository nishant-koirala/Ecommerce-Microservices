import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SUPPRESS_ERROR_TOAST } from '../interceptors/error.interceptor';
import { CreateInventoryRequest, InventoryResponse } from '../models/inventory';

const API = `${environment.apiUrl}/api/v1`;

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);

  /** Stock for one product, or null when no inventory row exists yet (404). */
  getByProduct(productId: number): Observable<InventoryResponse | null> {
    return this.http
      .get<InventoryResponse>(`${API}/inventory/product/${productId}`, {
        context: new HttpContext().set(SUPPRESS_ERROR_TOAST, true),
      })
      .pipe(catchError(() => of(null)));
  }

  /** ADMIN only — create an inventory row for a product. */
  create(request: CreateInventoryRequest): Observable<InventoryResponse> {
    return this.http.post<InventoryResponse>(`${API}/inventory`, request);
  }

  /** ADMIN only — add quantity back to a product's available stock. */
  restock(productId: number, quantity: number): Observable<InventoryResponse> {
    return this.http.post<InventoryResponse>(`${API}/inventory/restock`, {
      productId,
      quantity,
    });
  }

  /** ADMIN only — delete the inventory row for a product (called before product delete). */
  deleteByProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${API}/inventory/product/${productId}`);
  }

  /** Stock for many products in one call. */
  getBatch(productIds: number[]): Observable<Record<number, InventoryResponse>> {
    if (productIds.length === 0) {
      return of({});
    }
    return this.http
      .get<Record<number, InventoryResponse>>(`${API}/inventory/batch`, {
        params: { productIds: productIds.join(',') },
        context: new HttpContext().set(SUPPRESS_ERROR_TOAST, true),
      })
      .pipe(catchError(() => of({})));
  }
}
