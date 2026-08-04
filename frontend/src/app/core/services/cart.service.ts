import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ProductResponse } from '../models/product';
import {
  AddToCartRequest,
  CartItem,
  CartItemResponse,
  CheckoutResponse,
  UpdateQuantityRequest,
} from '../models/cart';
import { AuthService } from './auth.service';
import { ProductService } from './product.service';
import { StorageService } from '../utils/storage';
import { ToastService } from './toast.service';

const API = `${environment.apiUrl}/api/v1`;
const LOCAL_CART_KEY = 'cart.local';

/**
 * Signal-driven cart. Unauthenticated users get a localStorage-persisted
 * cart; on login the local items are pushed to the backend and the live
 * server cart takes over.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly auth = inject(AuthService);
  private readonly products = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly items = signal<CartItem[]>([]);
  readonly loading = signal(false);
  /** True while the cart lives in localStorage (not synced to the backend). */
  readonly isLocal = signal(false);

  readonly count = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  );

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        const local = this.storage.getObject<CartItem[]>(LOCAL_CART_KEY);
        if (local && local.length > 0) {
          this.pushLocalToBackend(user.id, local);
        } else {
          this.load(user.id);
        }
      } else {
        this.restoreLocal();
      }
    });
  }

  add(product: ProductResponse, quantity = 1): void {
    const user = this.auth.currentUser();
    if (user) {
      const body = { userId: user.id, productId: product.id, quantity } satisfies AddToCartRequest;
      this.http
        .post<CartItemResponse>(`${API}/cart`, body)
        .pipe(switchMap(() => this.load(user.id)))
        .subscribe({
          next: () => this.toast.success(`${product.name} added to cart`),
          error: () => this.toast.error('Could not add to cart'),
        });
    } else {
      this.addLocal(product, quantity);
      this.toast.success(`${product.name} added to cart`);
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) {
      return;
    }
    const user = this.auth.currentUser();
    if (user) {
      const body = { quantity } satisfies UpdateQuantityRequest;
      this.http
        .put<CartItemResponse>(`${API}/cart/${user.id}/${productId}`, body)
        .pipe(switchMap(() => this.load(user.id)))
        .subscribe({ error: () => this.toast.error('Could not update quantity') });
    } else {
      this.items.update((list) =>
        list.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
      );
      this.persistLocal();
    }
  }

  remove(productId: number): void {
    const user = this.auth.currentUser();
    if (user) {
      this.http
        .delete<void>(`${API}/cart/${user.id}/${productId}`)
        .pipe(switchMap(() => this.load(user.id)))
        .subscribe({ error: () => this.toast.error('Could not remove item') });
    } else {
      this.items.update((list) => list.filter((i) => i.product.id !== productId));
      this.persistLocal();
    }
  }

  clear(): void {
    this.items.set([]);
    if (this.isLocal()) {
      this.storage.remove(LOCAL_CART_KEY);
    }
  }

  checkout(): Observable<CheckoutResponse> {
    const user = this.auth.currentUser();
    if (!user) {
      return throwError(() => new Error('Sign in to checkout'));
    }
    const idempotencyKey =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${user.id}`;
    return this.http
      .post<CheckoutResponse>(
        `${API}/cart/${user.id}/checkout`,
        null,
        { headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }) },
      )
      .pipe(
        tap(() => {
          this.items.set([]);
          this.storage.remove(LOCAL_CART_KEY);
          this.toast.success('Order placed successfully');
        }),
      );
  }

  /** Fetch the server cart and enrich items with product details. */
  private load(userId: number): Observable<CartItem[]> {
    this.loading.set(true);
    return this.http.get<CartItemResponse[]>(`${API}/cart/${userId}`).pipe(
      switchMap((raw) => this.enrich(raw)),
      tap((items) => {
        this.items.set(items);
        this.isLocal.set(false);
        this.storage.remove(LOCAL_CART_KEY);
        this.loading.set(false);
      }),
      catchError(() => {
        this.items.set([]);
        this.isLocal.set(false);
        this.loading.set(false);
        return of([] as CartItem[]);
      }),
    );
  }

  private enrich(raw: CartItemResponse[]): Observable<CartItem[]> {
    return this.products.getCatalog().pipe(
      map((catalog) => {
        const byId = new Map<number, ProductResponse>(catalog.map((p) => [p.id, p]));
        return raw
          .filter((item) => byId.has(item.productId))
          .map((item) => ({
            id: item.id,
            userId: item.userId,
            product: byId.get(item.productId)!,
            quantity: item.quantity,
          }));
      }),
    );
  }

  private restoreLocal(): void {
    this.items.set(this.storage.getObject<CartItem[]>(LOCAL_CART_KEY) ?? []);
    this.isLocal.set(true);
    this.loading.set(false);
  }

  private addLocal(product: ProductResponse, quantity: number): void {
    const current = this.items();
    const existing = current.find((i) => i.product.id === product.id);
    const next = existing
      ? current.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i))
      : [...current, { id: -Date.now(), userId: 0, product, quantity }];
    this.items.set(next);
    this.persistLocal();
  }

  private persistLocal(): void {
    if (this.isLocal()) {
      this.storage.setObject(LOCAL_CART_KEY, this.items());
    }
  }

  private pushLocalToBackend(userId: number, local: CartItem[]): void {
    const requests = local.map((item) =>
      this.http
        .post<CartItemResponse>(`${API}/cart`, {
          userId,
          productId: item.product.id,
          quantity: item.quantity,
        } satisfies AddToCartRequest)
        .pipe(catchError(() => of(null))),
    );
    forkJoin(requests)
      .pipe(switchMap(() => this.load(userId)))
      .subscribe(() => {
        this.storage.remove(LOCAL_CART_KEY);
        this.toast.success('Cart synced to your account');
      });
  }
}
