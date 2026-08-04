import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CreatePaymentRequest, PaymentResponse } from '../models/payment';

const API = `${environment.apiUrl}/api/v1`;

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  create(request: CreatePaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${API}/payments`, request);
  }

  getById(id: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${API}/payments/${id}`);
  }

  refund(id: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${API}/payments/${id}/refund`, null);
  }
}
