import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { ProductResponse } from '../../core/models/product';
import { ReviewResponse } from '../../core/models/review';
import { AuthService } from '../../core/services/auth.service';
import { ImageService } from '../../core/services/image.service';
import { ProductService } from '../../core/services/product.service';
import { ReviewService } from '../../core/services/review.service';
import { ToastService } from '../../core/services/toast.service';
import { formatDate } from '../../core/utils/format';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LinkButtonComponent } from '../../shared/components/button/link-button.component';
import { RatingStarsComponent } from '../../shared/components/rating-stars/rating-stars.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

interface ReviewEntry {
  review: ReviewResponse;
  product: ProductResponse;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [RouterLink, RatingStarsComponent, ButtonComponent, LinkButtonComponent, SkeletonComponent],
  template: `
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav class="mb-8 text-sm text-neutral-500 dark:text-neutral-400" aria-label="Breadcrumb">
        <a routerLink="/" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Home</a>
        <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
        <a routerLink="/account" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Account</a>
        <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
        <span class="text-neutral-900 dark:text-neutral-50">My reviews</span>
      </nav>

      <h1 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
        My reviews
      </h1>

      @if (loading()) {
        <div class="mt-8 flex flex-col gap-4">
          <app-skeleton shape="h-40 w-full rounded-2xl" />
          <app-skeleton shape="h-40 w-full rounded-2xl" />
        </div>
      } @else if (entries().length === 0) {
        <div class="mt-8 rounded-2xl border border-dashed border-neutral-300 py-20 text-center dark:border-neutral-700">
          <p class="font-medium text-neutral-900 dark:text-neutral-50">You haven't written any reviews yet</p>
          <p class="mt-1 text-sm text-neutral-500">Reviews you leave on products will show up here.</p>
          <div class="mt-6">
            <app-link-button routerLink="/products">Browse products</app-link-button>
          </div>
        </div>
      } @else {
        <div class="mt-8 flex flex-col gap-5">
          @for (entry of entries(); track entry.review.id) {
            <article class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <a routerLink="/products/{{ entry.product.id }}" class="flex min-w-0 items-center gap-4">
                  <img
                    [src]="image(entry.product)"
                    [alt]="entry.product.name"
                    class="size-16 shrink-0 rounded-xl object-cover"
                    width="64"
                    height="64"
                    loading="lazy"
                  />
                  <span class="min-w-0">
                    <span class="block truncate font-medium text-neutral-900 hover:text-primary-700 dark:text-neutral-50 dark:hover:text-primary-300">
                      {{ entry.product.name }}
                    </span>
                    <span class="mt-1 block text-xs text-neutral-500">{{ formatDate(entry.review.createdAt) }}</span>
                  </span>
                </a>
                <app-button size="sm" variant="outline" [busy]="deleting() === entry.review.id"
                  (click)="confirmDelete(entry)">
                  Delete
                </app-button>
              </div>

              <div class="mt-4 flex items-center gap-2">
                <app-rating-stars [value]="entry.review.rating" />
                <span class="text-sm font-medium text-neutral-700 dark:text-neutral-200">{{ entry.review.rating }} / 5</span>
              </div>

              @if (entry.review.title) {
                <h2 class="mt-3 font-medium text-neutral-900 dark:text-neutral-50">{{ entry.review.title }}</h2>
              }
              @if (entry.review.comment) {
                <p class="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{{ entry.review.comment }}</p>
              }
            </article>
          }
        </div>
      }
    </main>
  `,
})
export class ReviewsComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly reviews = inject(ReviewService);
  private readonly products = inject(ProductService);
  private readonly imageService = inject(ImageService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly deleting = signal<number | null>(null);
  readonly entries = signal<ReviewEntry[]>([]);

  formatDate = formatDate;

  image(product: ProductResponse): string {
    return this.imageService.product(product, 128);
  }

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) {
      this.loading.set(false);
      return;
    }
    this.reviews
      .getByUser(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe({
        next: (reviews) => {
          if (reviews.length === 0) {
            this.entries.set([]);
            this.loading.set(false);
            return;
          }
          this.products.getCatalog().pipe(take(1)).subscribe((catalog) => {
            const byId = new Map<number, ProductResponse>(catalog.map((p) => [p.id, p]));
            const enriched = reviews
              .filter((r) => byId.has(r.productId))
              .map((r) => ({ review: r, product: byId.get(r.productId)! }));
            this.entries.set(enriched);
            this.loading.set(false);
          });
        },
        error: () => {
          this.loading.set(false);
          this.toast.error('Could not load your reviews');
        },
      });
  }

  confirmDelete(entry: ReviewEntry): void {
    if (this.deleting() !== null) {
      return;
    }
    this.deleting.set(entry.review.id);
    this.reviews.remove(entry.review.id).pipe(take(1)).subscribe({
      next: () => {
        this.deleting.set(null);
        this.entries.update((list) => list.filter((e) => e.review.id !== entry.review.id));
        this.toast.success('Review deleted');
      },
      error: () => {
        this.deleting.set(null);
        this.toast.error('Could not delete your review');
      },
    });
  }
}
