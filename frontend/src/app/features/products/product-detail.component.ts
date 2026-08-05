import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpContext } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

import { ProductResponse } from '../../core/models/product';
import { ReviewResponse } from '../../core/models/review';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ImageService } from '../../core/services/image.service';
import { PlatformService } from '../../core/services/platform.service';
import { ProductService } from '../../core/services/product.service';
import { ReviewService } from '../../core/services/review.service';
import { ToastService } from '../../core/services/toast.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { SUPPRESS_ERROR_TOAST } from '../../core/interceptors/error.interceptor';
import { formatDate, formatPrice } from '../../core/utils/format';
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
    ReactiveFormsModule,
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
              @if (reviewCount() > 0) {
                <span class="text-sm text-neutral-500 dark:text-neutral-400">
                  {{ rating().toFixed(1) }} · {{ reviewCount() }} review{{ reviewCount() === 1 ? '' : 's' }}
                </span>
              } @else {
                <span class="text-sm text-neutral-500 dark:text-neutral-400">No reviews yet</span>
              }
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

              <button
                type="button"
                (click)="toggleWishlist()"
                class="flex size-12 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white transition-all hover:bg-neutral-50 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:hover:border-neutral-600"
                [attr.aria-label]="wishlist.isInWishlist(product()!.id) ? 'Remove from wishlist' : 'Add to wishlist'"
              >
                @if (wishlist.isInWishlist(product()!.id)) {
                  <svg viewBox="0 0 24 24" fill="currentColor" class="size-6 text-red-500" aria-hidden="true">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" stroke="currentColor" class="size-6 text-neutral-500" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                  </svg>
                }
              </button>

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

        <!-- Reviews -->
        <section class="mt-16">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">Ratings</p>
              <h2 class="mt-2 font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                Reviews
              </h2>
            </div>
            @if (auth.isAuthenticated()) {
              <app-button
                size="sm"
                [variant]="showForm() ? 'outline' : 'primary'"
                (click)="toggleReviewForm()"
              >
                {{ myReview() ? 'Edit your review' : 'Write a review' }}
              </app-button>
            }
          </div>

          <div class="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
            <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              @if (reviewCount() > 0) {
                <p class="font-display text-5xl font-bold text-neutral-900 dark:text-neutral-50">
                  {{ rating().toFixed(1) }}
                </p>
                <div class="mt-2">
                  <app-rating-stars [value]="rating()" />
                </div>
                <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {{ reviewCount() }} review{{ reviewCount() === 1 ? '' : 's' }}
                </p>
              } @else {
                <p class="font-display text-lg font-medium text-neutral-900 dark:text-neutral-100">No reviews yet</p>
                <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Be the first to review this product.</p>
              }
            </div>

            <div>
              @if (reviewsLoading()) {
                <div class="flex flex-col gap-4">
                  <app-skeleton shape="h-24 w-full rounded-2xl" />
                  <app-skeleton shape="h-24 w-full rounded-2xl" />
                </div>
              } @else if (reviews().length === 0) {
                <p class="text-sm text-neutral-500 dark:text-neutral-400">No reviews yet.</p>
              } @else {
                <ul class="space-y-4">
                  @for (review of reviews(); track review.id) {
                    <li class="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                      <div class="flex items-start justify-between gap-4">
                        <div>
                          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{{ review.reviewerName }}</p>
                          <div class="mt-1 flex items-center gap-2">
                            <app-rating-stars [value]="review.rating" />
                            <span class="text-xs text-neutral-400">{{ formatDate(review.createdAt) }}</span>
                          </div>
                        </div>
                        @if (review.userId === auth.currentUser()?.id) {
                          <button
                            type="button"
                            (click)="deleteReview(review.id)"
                            class="text-xs font-medium text-neutral-400 transition-colors hover:text-red-500"
                            aria-label="Delete your review"
                          >
                            Delete
                          </button>
                        }
                      </div>
                      @if (review.title) {
                        <p class="mt-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ review.title }}</p>
                      }
                      @if (review.comment) {
                        <p class="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{{ review.comment }}</p>
                      }
                    </li>
                  }
                </ul>
              }
            </div>
          </div>

          @if (auth.isAuthenticated() && showForm()) {
            <form
              class="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
              [formGroup]="reviewForm"
              (ngSubmit)="submitReview()"
            >
              <h3 class="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {{ myReview() ? 'Edit your review' : 'Write a review' }}
              </h3>
              <div class="mt-4 flex items-center gap-1">
                <span class="mr-2 text-sm text-neutral-500 dark:text-neutral-400">Your rating</span>
                @for (star of starOptions; track star) {
                  <button
                    type="button"
                    (click)="setReviewRating(star)"
                    [attr.aria-label]="'Rate ' + star + ' star'"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      class="size-6"
                      [attr.fill]="reviewRating() >= star ? 'currentColor' : 'none'"
                      [class]="reviewRating() >= star ? 'text-accent-500' : 'text-neutral-300 dark:text-neutral-600'"
                      aria-hidden="true"
                    >
                      <path
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linejoin="round"
                        d="M10 1.5l2.47 5.01 5.53.8-4 3.9.95 5.52L10 14.11l-4.95 2.6.95-5.52-4-3.9 5.53-.8L10 1.5z"
                      />
                    </svg>
                  </button>
                }
              </div>
              <div class="mt-4 grid gap-4">
                <input
                  formControlName="title"
                  type="text"
                  placeholder="Review title (optional)"
                  class="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-primary-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
                <textarea
                  formControlName="comment"
                  rows="4"
                  placeholder="Share your experience with this product (optional)"
                  class="w-full resize-none rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-primary-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                ></textarea>
              </div>
              <div class="mt-4 flex items-center gap-3">
                <app-button size="sm" type="submit" [disabled]="submitting()">
                  {{ submitting() ? 'Saving…' : myReview() ? 'Update review' : 'Submit review' }}
                </app-button>
                <button
                  type="button"
                  (click)="toggleReviewForm()"
                  class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          }
        </section>
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
  private readonly reviewsService = inject(ReviewService);
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly cart = inject(CartService);
  private readonly imageService = inject(ImageService);
  private readonly platform = inject(PlatformService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly wishlist = inject(WishlistService);

  readonly loading = signal(true);
  readonly product = signal<ProductResponse | null>(null);
  readonly related = signal<ProductResponse[]>([]);
  readonly qty = signal(1);
  readonly added = signal(false);

  readonly imageUrl = computed(() =>
    this.product() ? this.imageService.product(this.product()!, 900) : '',
  );
  readonly price = computed(() => (this.product() ? formatPrice(this.product()!.price) : ''));
  readonly rating = computed(() =>
    this.product() ? this.reviewsService.ratingFor(this.product()!.id) : 0,
  );
  readonly reviewCount = computed(() =>
    this.product() ? this.reviewsService.countFor(this.product()!.id) : 0,
  );

  readonly reviews = signal<ReviewResponse[]>([]);
  readonly reviewsLoading = signal(false);
  readonly reviewRating = signal(5);
  readonly showForm = signal(false);
  readonly submitting = signal(false);
  readonly reviewForm = new FormGroup({
    title: new FormControl(''),
    comment: new FormControl(''),
  });
  protected readonly starOptions = [1, 2, 3, 4, 5];
  protected readonly formatDate = formatDate;

  readonly myReview = computed(() => {
    const user = this.auth.currentUser();
    return user ? this.reviews().find((r) => r.userId === user.id) ?? null : null;
  });

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

  toggleWishlist(): void {
    const product = this.product();
    if (!product) {
      return;
    }
    this.wishlist.toggle(product.id);
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    this.productsService.getById(id).pipe(take(1)).subscribe({
      next: (product) => {
        this.product.set(product);
        this.qty.set(1);
        this.loading.set(false);
        this.loadRelated(product);
        this.reviewsService.ensureSummaries([id]);
        this.loadReviews(id);
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

  private loadReviews(productId: number): void {
    this.reviewsLoading.set(true);
    this.reviewsService.getByProduct(productId).pipe(take(1)).subscribe({
      next: (list) => {
        this.reviews.set(list);
        this.reviewsLoading.set(false);
      },
      error: () => {
        this.reviews.set([]);
        this.reviewsLoading.set(false);
      },
    });
  }

  toggleReviewForm(): void {
    if (this.showForm()) {
      this.showForm.set(false);
      return;
    }
    const mine = this.myReview();
    if (mine) {
      this.reviewRating.set(mine.rating);
      this.reviewForm.setValue({ title: mine.title ?? '', comment: mine.comment ?? '' });
    } else {
      this.reviewRating.set(5);
      this.reviewForm.setValue({ title: '', comment: '' });
    }
    this.showForm.set(true);
  }

  setReviewRating(rating: number): void {
    this.reviewRating.set(rating);
  }

  submitReview(): void {
    const product = this.product();
    const user = this.auth.currentUser();
    if (!product || !user || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    const raw = this.reviewForm.getRawValue();
    this.reviewsService
      .create({
        userId: user.id,
        productId: product.id,
        rating: this.reviewRating(),
        title: raw.title ?? '',
        comment: raw.comment ?? '',
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.toast.success('Thank you for your review');
          this.reviewsService.refreshSummary(product.id);
          this.loadReviews(product.id);
        },
        error: () => {
          this.submitting.set(false);
        },
      });
  }

  deleteReview(id: number): void {
    if (!window.confirm('Delete this review?')) {
      return;
    }
    this.reviewsService.remove(id).pipe(take(1)).subscribe({
      next: () => {
        const product = this.product();
        if (product) {
          this.reviewsService.refreshSummary(product.id);
          this.loadReviews(product.id);
        }
        this.toast.success('Review deleted');
      },
      error: () => undefined,
    });
  }
}
