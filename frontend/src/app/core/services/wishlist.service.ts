import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ProductResponse } from '../models/product';
import { WishlistItemResponse, AddToWishlistRequest } from '../models/wishlist';
import { AuthService } from './auth.service';
import { ProductService } from './product.service';
import { ToastService } from './toast.service';

const API = `${environment.apiUrl}/api/v1`;

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly products = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly items = signal<WishlistItemResponse[]>([]);
  readonly loading = signal(false);

  readonly count = computed(() => this.items().length);

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.load(user.id);
      } else {
        this.items.set([]);
        this.loading.set(false);
      }
    });
  }

  toggle(productId: number): void {
    const user = this.auth.currentUser();
    if (!user) {
      this.toast.error('Sign in to use wishlist');
      return;
    }
    if (this.isInWishlist(productId)) {
      this.remove(user.id, productId);
    } else {
      this.add(user.id, productId);
    }
  }

  isInWishlist(productId: number): boolean {
    return this.items().some((item) => item.productId === productId);
  }

  private add(userId: number, productId: number): void {
    const body = { userId, productId } satisfies AddToWishlistRequest;
    this.http
      .post<WishlistItemResponse>(`${API}/wishlist`, body)
      .pipe(switchMap(() => this.load(userId)))
      .subscribe({
        next: () => this.toast.success('Added to wishlist'),
        error: () => this.toast.error('Could not add to wishlist'),
      });
  }

  private remove(userId: number, productId: number): void {
    this.http
      .delete<void>(`${API}/wishlist/user/${userId}/product/${productId}`)
      .pipe(switchMap(() => this.load(userId)))
      .subscribe({
        next: () => this.toast.success('Removed from wishlist'),
        error: () => this.toast.error('Could not remove from wishlist'),
      });
  }

  load(userId: number): Observable<WishlistItemResponse[]> {
    this.loading.set(true);
    return this.http.get<WishlistItemResponse[]>(`${API}/wishlist/user/${userId}`).pipe(
      tap((items) => {
        this.items.set(items);
        this.loading.set(false);
      }),
      catchError(() => {
        this.items.set([]);
        this.loading.set(false);
        return of([] as WishlistItemResponse[]);
      }),
    );
  }
}