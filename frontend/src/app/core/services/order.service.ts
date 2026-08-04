import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CreateOrderRequest, OrderResponse } from '../models/order';

const API = `${environment.apiUrl}/api/v1`;

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  getByUser(userId: number): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${API}/orders/user/${userId}`);
  }

  getById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${API}/orders/${id}`);
  }

  create(request: CreateOrderRequest, idempotencyKey: string): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${API}/orders`, request, {
      headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }),
    });
  }

  cancel(id: number): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${API}/orders/${id}/cancel`, null);
  }

  /** ADMIN only — all orders across customers. */
  listAll(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${API}/orders`);
  }

  /** ADMIN only — advance a confirmed order to shipped. */
  ship(id: number): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${API}/orders/${id}/ship`, null);
  }

  /** ADMIN only — advance a shipped order to delivered. */
  deliver(id: number): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${API}/orders/${id}/deliver`, null);
  }
}
