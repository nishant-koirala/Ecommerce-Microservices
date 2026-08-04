import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

import { ProductResponse } from '../../core/models/product';
import { CartService } from '../../core/services/cart.service';
import { ImageService } from '../../core/services/image.service';
import { PlatformService } from '../../core/services/platform.service';
import { ProductService } from '../../core/services/product.service';
import { formatPrice, pseudoRating, pseudoReviewCount } from '../../core/utils/format';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LinkButtonComponent } from '../../shared/components/button/link-button.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { RatingStarsComponent } from '../../shared/components/rating-stars/rating-stars.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    LinkButtonComponent,
    ProductCardComponent,
    RatingStarsComponent,
    SkeletonComponent,
  ],
  template: `
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav class="mb-8 text-sm text-neutral-500 dark:text-neutral-400" aria-label="Breadcrumb">
        <a routerLink="/" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Home</a>
        <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
        <a routerLink="/products" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Shop</a>
        @if (product()) {
          <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
          <a
            routerLink="/products"
            [queryParams]="{ categoryId: product()!.category.id }"
            class="transition-colors hover:text-primary-700 dark:hover:text-primary-300"
          >
            {{ product()!.category.name }}
          </a>
          <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
          <span class="text-neutral-900 dark:text-neutral-50">{{ product()!.name }}</span>
        }
      </nav>

      @if (loading()) {
        <div class="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <app-skeleton shape="aspect-square w-full rounded-3xl" />
          <div class="flex flex-col gap-4">
            <app-skeleton shape="h-5 w-24" />
            <app-skeleton shape="h-10 w-3/4" />
            <app-skeleton shape="h-5 w-40" />
            <app-skeleton shape="h-8 w-28" />
            <app-skeleton shape="h-24 w-full" />
            <app-skeleton shape="h-12 w-full" />
          </div>
        </div>
      } @else if (!product()) {
        <div class="rounded-2xl border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
          <p class="font-display text-lg font-medium text-neutral-900 dark:text-neutral-100">Product not found</p>
          <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">It may have been removed from the catalog.</p>
          <div class="mt-6">
            <app-link-button routerLink="/products" variant="outline">Back to shop</app-link-button>
          </div>
        </div>
      } @else {
        <div class="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <!-- Gallery -->
          <div class="relative">
            <div class="group overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-800">
              <img
                [src]="imageUrl()"
                [alt]="product()!.name"
                class="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                fetchpriority="high"
              />
            </div>
            <span class="absolute left-4 top-4">
              <app-badge tone="accent">{{ product()!.category.name }}</app-badge>
            </span>
          </div>

          <!-- Summary -->
          <div class="flex flex-col">
            <h1 class="font-display text-3xl font-semibold leading-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl">
              {{ product()!.name }}
            </h1>

            <div class="mt-3 flex items-center gap-2">
              <app-rating-stars [value]="rating()" />
              <span class="text-sm text-neutral-500 dark:text-neutral-400">
                {{ rating().toFixed(1) }} · {{ reviewCount() }} reviews
              </span>
            </div>

            <p class="mt-6 font-display text-3xl font-semibold text-neutral-900 dark:text-neutral-50">
              {{ price() }}
            </p>

            <p class="mt-6 text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
              {{ product()!.description }}
            </p>

            <!-- Quantity + add to cart -->
            <div class="mt-8 flex items-center gap-4">
              <div class="flex items-center rounded-full border border-neutral-300 dark:border-neutral-700">
                <button
                  type="button"
                  (click)="decrement()"
                  [disabled]="qty() === 1"
                  class="flex size-11 items-center justify-center rounded-l-full text-neutral-600 transition-colors hover:text-neutral-900 disabled:opacity-40 dark:text-neutral-300 dark:hover:text-neutral-50"
                  aria-label="Decrease quantity"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" class="size-4" aria-hidden="true"><path fill-rule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10z" clip-rule="evenodd"/></svg>
                </button>
                <span class="w-10 text-center text-sm font-semibold text-neutral-900 dark:text-neutral-100" aria-live="polite">
                  {{ qty() }}
                </span>
                <button
                  type="button"
                  (click)="increment()"
                  class="flex size-11 items-center justify-center rounded-r-full text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
                  aria-label="Increase quantity"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" class="size-4" aria-hidden="true"><path fill-rule="evenodd" d="M10 4a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 10 4z" clip-rule="evenodd"/></svg>
                </button>
              </div>

              <app-button
                class="flex-1"
                size="lg"
                [fullWidth]="true"
                [variant]="added() ? 'accent' : 'primary'"
                (click)="addToCart()"
              >
                @if (added()) {
                  <span class="flex items-center gap-2">
                    <svg viewBox="0 0 20 20" fill="currentColor" class="size-5" aria-hidden="true">
                      <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l4.1 4.1 6.8-6.8a1 1 0 0 1 1.1 0z" clip-rule="evenodd"/>
                    </svg>
                    Added to cart
                  </span>
                } @else {
                  Add to cart · {{ price() }}
                }
              </app-button>
            </div>

            <div class="mt-4 text-xs text-neutral-400">
              In stock · Free shipping over $75 · 30-day returns
            </div>

            <!-- Details -->
            <dl class="mt-8 space-y-3 border-t border-neutral-200 pt-6 text-sm dark:border-neutral-800">
              <div class="flex justify-between gap-4">
                <dt class="text-neutral-500 dark:text-neutral-400">SKU</dt>
                <dd class="font-medium text-neutral-900 dark:text-neutral-100">{{ product()!.sku }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-neutral-500 dark:text-neutral-400">Category</dt>
                <dd class="font-medium text-neutral-900 dark:text-neutral-100">{{ product()!.category.name }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-neutral-500 dark:text-neutral-400">Collection</dt>
                <dd class="font-medium text-neutral-900 dark:text-neutral-100">{{ product()!.category.description }}</dd>
              </div>
            </dl>
          </div>
        </div>
      }

      <!-- Related products -->
      @if (!loading() && related().length > 0) {
        <section class="mt-20">
          <div class="mb-8 flex items-end justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">You may also like</p>
              <h2 class="mt-2 font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                Related products
              </h2>
            </div>
            <a routerLink="/products" class="hidden shrink-0 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-700 sm:block dark:text-neutral-400 dark:hover:text-primary-300">
              View all &rarr;
            </a>
          </div>
          <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            @for (item of related(); track item.id) {
              <app-product-card [product]="item" />
            }
          </div>
        </section>
      }
    </main>
  `,
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly imageService = inject(ImageService);
  private readonly platform = inject(PlatformService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly product = signal<ProductResponse | null>(null);
  readonly related = signal<ProductResponse[]>([]);
  readonly qty = signal(1);
  readonly added = signal(false);

  readonly imageUrl = computed(() =>
    this.product() ? this.imageService.product(this.product()!, 900) : '',
  );
  readonly price = computed(() => (this.product() ? formatPrice(this.product()!.price) : ''));
  readonly rating = computed(() => (this.product() ? pseudoRating(this.product()!.id) : 0));
  readonly reviewCount = computed(() =>
    this.product() ? pseudoReviewCount(this.product()!.id) : 0,
  );

  ngOnInit(): void {
    if (!this.platform.isBrowser) {
      return;
    }
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isInteger(id) || id <= 0) {
        this.router.navigate(['/products']);
        return;
      }
      this.loadProduct(id);
    });
  }

  decrement(): void {
    this.qty.update((q) => Math.max(1, q - 1));
  }

  increment(): void {
    this.qty.update((q) => q + 1);
  }

  addToCart(): void {
    const product = this.product();
    if (!product) {
      return;
    }
    this.cart.add(product, this.qty());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1400);
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    this.productsService.getById(id).pipe(take(1)).subscribe({
      next: (product) => {
        this.product.set(product);
        this.qty.set(1);
        this.loading.set(false);
        this.loadRelated(product);
      },
      error: () => {
        this.product.set(null);
        this.loading.set(false);
      },
    });
  }

  private loadRelated(product: ProductResponse): void {
    this.productsService.getCatalog().pipe(take(1)).subscribe((all) => {
      this.related.set(
        all
          .filter((p) => p.category.id === product.category.id && p.id !== product.id)
          .slice(0, 4),
      );
    });
  }
}
