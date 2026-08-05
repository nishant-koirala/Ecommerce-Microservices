import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductResponse } from '../../../core/models/product';
import { CartService } from '../../../core/services/cart.service';
import { ImageService } from '../../../core/services/image.service';
import { ReviewService } from '../../../core/services/review.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { formatPrice } from '../../../core/utils/format';
import { BadgeComponent } from '../badge/badge.component';
import { ButtonComponent } from '../button/button.component';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, BadgeComponent, ButtonComponent, RatingStarsComponent],
  template: `
    <article
      class="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:border-neutral-800 dark:bg-neutral-900 dark:hover:shadow-card-dark"
    >
      <a
        [routerLink]="['/products', product().id]"
        class="relative block aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800"
      >
        <img
          [src]="imageUrl()"
          [alt]="product().name"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <span class="absolute left-3 top-3">
          <app-badge tone="accent">{{ product().category.name }}</app-badge>
        </span>
        <button
          type="button"
          (click)="toggleWishlist($event)"
          class="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-neutral-500 transition-all hover:bg-white hover:text-red-500 dark:bg-neutral-900/90 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-red-400"
          [attr.aria-label]="inWishlist() ? 'Remove from wishlist' : 'Add to wishlist'"
        >
          @if (inWishlist()) {
            <svg viewBox="0 0 24 24" fill="currentColor" class="size-5" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" stroke="currentColor" class="size-5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
            </svg>
          }
        </button>
      </a>

      <div class="flex flex-1 flex-col gap-1.5 p-4">
        <a
          [routerLink]="['/products', product().id]"
          class="font-display text-lg font-semibold leading-snug text-neutral-900 transition-colors hover:text-primary-700 dark:text-neutral-50 dark:hover:text-primary-300"
        >
          {{ product().name }}
        </a>

        <p class="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
          {{ product().description }}
        </p>

        <div class="mt-1 flex items-center gap-2">
          <app-rating-stars [value]="rating()" />
          @if (reviewCount() > 0) {
            <span class="text-xs text-neutral-400">({{ reviewCount() }})</span>
          } @else {
            <span class="text-xs text-neutral-400">No reviews</span>
          }
        </div>

        <div class="mt-auto flex items-center justify-between pt-3">
          <span class="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {{ price() }}
          </span>
          <app-button
            size="sm"
            [variant]="added() ? 'accent' : 'primary'"
            (click)="addToCart()"
            [attr.aria-label]="'Add ' + product().name + ' to cart'"
          >
            @if (added()) {
              <span class="flex items-center gap-1.5">
                <svg viewBox="0 0 20 20" fill="currentColor" class="size-4" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l4.1 4.1 6.8-6.8a1 1 0 0 1 1.1 0z" clip-rule="evenodd"/>
                </svg>
                Added
              </span>
            } @else {
              Add to cart
            }
          </app-button>
        </div>
      </div>
    </article>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<ProductResponse>();

  private readonly imageService = inject(ImageService);
  private readonly cart = inject(CartService);
  private readonly reviews = inject(ReviewService);
  private readonly wishlist = inject(WishlistService);

  protected readonly added = signal(false);
  protected readonly imageUrl = computed(() => this.imageService.product(this.product()));
  protected readonly price = computed(() => formatPrice(this.product().price));
  protected readonly rating = computed(() => this.reviews.ratingFor(this.product().id));
  protected readonly reviewCount = computed(() => this.reviews.countFor(this.product().id));
  protected readonly inWishlist = computed(() => this.wishlist.isInWishlist(this.product().id));

  addToCart(): void {
    this.cart.add(this.product());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1400);
  }

  toggleWishlist(event: Event): void {
    event.stopPropagation();
    this.wishlist.toggle(this.product().id);
  }
}
