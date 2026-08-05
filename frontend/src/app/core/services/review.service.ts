import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ReviewRequest, ReviewResponse, ReviewSummary } from '../models/review';
import { pseudoRating, pseudoReviewCount } from '../utils/format';

const API = `${environment.apiUrl}/api/v1`;

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);

  /** Product ids whose summary has been fetched (even when empty -> no reviews). */
  private readonly checkedIds = signal<Set<number>>(new Set());
  private readonly summaries = signal<Record<number, ReviewSummary>>({});

  getByProduct(productId: number): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${API}/reviews/product/${productId}`);
  }

  create(request: ReviewRequest, context?: HttpContext): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${API}/reviews`, request, { context });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/reviews/${id}`);
  }

  ensureSummaries(productIds: number[]): void {
    const missing = [...new Set(productIds)].filter((id) => !this.checkedIds().has(id));
    if (missing.length === 0) {
      return;
    }
    this.checkedIds.update((set) => new Set([...set, ...missing]));
    this.http
      .get<ReviewSummary[]>(`${API}/reviews/summary`, { params: { productIds: missing } })
      .subscribe({
        next: (list) => {
          this.summaries.update((prev) => {
            const next = { ...prev };
            for (const s of list) {
              next[s.productId] = s;
            }
            return next;
          });
        },
        error: () => undefined,
      });
  }

  /** Drop the cached summary for a product so the next ensureSummaries refetches it. */
  refreshSummary(productId: number): void {
    this.summaries.update((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    this.checkedIds.update((set) => {
      const next = new Set(set);
      next.delete(productId);
      return next;
    });
    this.ensureSummaries([productId]);
  }

  /** Real average when the summary has loaded; pseudo fallback only before the check lands. */
  ratingFor(productId: number): number {
    if (!this.checkedIds().has(productId)) {
      return pseudoRating(productId);
    }
    return this.summaries()[productId]?.avgRating ?? 0;
  }

  countFor(productId: number): number {
    if (!this.checkedIds().has(productId)) {
      return pseudoReviewCount(productId);
    }
    return this.summaries()[productId]?.reviewCount ?? 0;
  }
}
