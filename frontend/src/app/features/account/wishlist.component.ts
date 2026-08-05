import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { ProductResponse } from '../../core/models/product';
import { WishlistItemResponse } from '../../core/models/wishlist';
import { AuthService } from '../../core/services/auth.service';
import { ImageService } from '../../core/services/image.service';
import { ProductService } from '../../core/services/product.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { formatDate, formatPrice } from '../../core/utils/format';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LinkButtonComponent } from '../../shared/components/button/link-button.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, LinkButtonComponent, ProductCardComponent, SkeletonComponent],
  template: `
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav class="mb-8 text-sm text-neutral-500 dark:text-neutral-400" aria-label="Breadcrumb">
        <a routerLink="/" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Home</a>
        <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
        <span class="text-neutral-900 dark:text-neutral-50">My wishlist</span>
      </nav>

      <h1 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
        My wishlist
      </h1>

      @if (wishlist.loading()) {
        <div class="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          @for (_ of [1,2,3,4]; track $index) {
            <app-skeleton shape="aspect-square w-full rounded-2xl" />
          }
        </div>
      } @else if (items().length === 0) {
        <div class="mt-8 rounded-2xl border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
          <p class="font-display text-lg font-medium text-neutral-900 dark:text-neutral-100">Your wishlist is empty</p>
          <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Save products you love and find them here later.
          </p>
          <div class="mt-6">
            <app-link-button routerLink="/products" variant="outline">Continue shopping</app-link-button>
          </div>
        </div>
      } @else {
        <p class="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          {{ items().length }} {{ items().length === 1 ? 'item' : 'items' }} in your wishlist
        </p>
        <div class="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          @for (item of items(); track item.id) {
            <app-product-card [product]="item.product" />
          }
        </div>
      }
    </main>
  `,
})
export class WishlistComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly products = inject(ProductService);
  protected readonly wishlist = inject(WishlistService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = signal<{ id: number; product: ProductResponse }[]>([]);

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      return;
    }
    this.loadWishlist(userId);
  }

  private loadWishlist(userId: number): void {
    this.wishlist.load(userId).pipe(takeUntilDestroyed(this.destroyRef), take(1)).subscribe({
      next: (wishlistItems: WishlistItemResponse[]) => {
        if (wishlistItems.length === 0) {
          this.items.set([]);
          return;
        }
        const productIds = wishlistItems.map((i) => i.productId);
        this.products.getCatalog().pipe(take(1)).subscribe((catalog) => {
          const byId = new Map<number, ProductResponse>(catalog.map((p) => [p.id, p]));
          const enriched = wishlistItems
            .filter((i) => byId.has(i.productId))
            .map((i) => ({ id: i.id, product: byId.get(i.productId)! }));
          this.items.set(enriched);
        });
      },
      error: () => {
        this.toast.error('Could not load wishlist');
      },
    });
  }
}