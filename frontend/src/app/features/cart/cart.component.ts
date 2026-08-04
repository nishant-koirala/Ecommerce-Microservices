import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CartItem } from '../../core/models/cart';
import { ProductResponse } from '../../core/models/product';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ImageService } from '../../core/services/image.service';
import { formatPrice } from '../../core/utils/format';
import { FREE_SHIPPING_THRESHOLD, shippingCost } from '../../core/utils/shipping';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LinkButtonComponent } from '../../shared/components/button/link-button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, ButtonComponent, LinkButtonComponent, SkeletonComponent],
  template: `
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav class="mb-4 text-sm text-neutral-500 dark:text-neutral-400" aria-label="Breadcrumb">
        <a routerLink="/" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Home</a>
        <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
        <span class="text-neutral-900 dark:text-neutral-50">Cart</span>
      </nav>

      <header class="mb-8">
        <p class="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">Your basket</p>
        <h1 class="mt-1 font-display text-3xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-4xl">
          Shopping Cart
          @if (cart.items().length > 0) {
            <span class="text-2xl text-neutral-400">({{ cart.items().length }})</span>
          }
        </h1>
      </header>

      @if (cart.loading()) {
        <div class="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div class="flex flex-col gap-4">
            @for (i of [1, 2, 3]; track i) {
              <div class="flex gap-5 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
                <app-skeleton shape="size-28 shrink-0 rounded-xl" />
                <div class="flex flex-1 flex-col gap-3">
                  <app-skeleton shape="h-5 w-1/2" />
                  <app-skeleton shape="h-4 w-24" />
                  <app-skeleton shape="h-9 w-full" />
                </div>
              </div>
            }
          </div>
          <app-skeleton shape="h-72 rounded-2xl" />
        </div>
      } @else if (cart.items().length === 0) {
        <div class="flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 px-6 py-20 text-center dark:border-neutral-700">
          <span class="flex size-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-8 text-neutral-400" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.4l2.2 13.2a1.5 1.5 0 0 0 1.5 1.3h9.2a1.5 1.5 0 0 0 1.5-1.2l1.2-7.3H5.1" />
              <circle cx="9" cy="20.5" r="1" />
              <circle cx="17" cy="20.5" r="1" />
            </svg>
          </span>
          <h2 class="mt-5 font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            Your cart is empty
          </h2>
          <p class="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
            Browse the collection and add something you'll love — shipping is free over {{ formatPrice(FREE_SHIPPING_THRESHOLD) }}.
          </p>
          <div class="mt-7">
            <app-link-button routerLink="/products" size="lg">Continue shopping</app-link-button>
          </div>
        </div>
      } @else {
        <div class="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
          <!-- Line items -->
          <section class="flex flex-col gap-4" aria-label="Cart items">
            @for (item of cart.items(); track item.id) {
              <div class="flex gap-5 rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
                <a [routerLink]="['/products', item.product.id]" class="group relative block shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                  <img
                    [src]="image(item.product)"
                    [alt]="item.product.name"
                    class="size-28 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </a>

                <div class="flex flex-1 flex-col">
                  <div class="flex items-start justify-between gap-4">
                    <a
                      [routerLink]="['/products', item.product.id]"
                      class="font-display text-base font-semibold leading-snug text-neutral-900 transition-colors hover:text-primary-700 dark:text-neutral-50 dark:hover:text-primary-300"
                    >
                      {{ item.product.name }}
                    </a>
                    <button
                      type="button"
                      (click)="cart.remove(item.product.id)"
                      class="flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-600 dark:hover:bg-neutral-800"
                      [attr.aria-label]="'Remove ' + item.product.name + ' from cart'"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" class="size-4" aria-hidden="true">
                        <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.44H3.06a.75.75 0 0 0 0 1.5h.78l.67 11.3A2.75 2.75 0 0 0 7.25 19.5h5.5a2.75 2.75 0 0 0 2.74-2.51l.67-11.3h.78a.75.75 0 0 0 0-1.5h-2.94v-.44A2.75 2.75 0 0 0 11.25 1h-2.5zM7.5 3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v.44H7.5v-.44zm-2.42 2.19h9.84l-.65 11.06a1.25 1.25 0 0 1-1.25 1.14h-5.5a1.25 1.25 0 0 1-1.25-1.14l-.64-11.06zm3.59 2.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75zm3.75.75a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-1.5 0v-4.5z" clip-rule="evenodd"/>
                      </svg>
                    </button>
                  </div>

                  <p class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{{ item.product.category.name }}</p>
                  <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{{ formatPrice(item.product.price) }} each</p>

                  <div class="mt-auto flex items-center justify-between gap-4 pt-4">
                    <div class="flex items-center rounded-full border border-neutral-300 dark:border-neutral-700">
                      <button
                        type="button"
                        (click)="decrement(item)"
                        [disabled]="item.quantity === 1"
                        class="flex size-9 items-center justify-center rounded-l-full text-neutral-600 transition-colors hover:text-neutral-900 disabled:opacity-40 dark:text-neutral-300 dark:hover:text-neutral-50"
                        [attr.aria-label]="'Decrease quantity of ' + item.product.name"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5" aria-hidden="true"><path fill-rule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10z" clip-rule="evenodd"/></svg>
                      </button>
                      <span class="w-8 text-center text-sm font-semibold text-neutral-900 dark:text-neutral-100" aria-live="polite">{{ item.quantity }}</span>
                      <button
                        type="button"
                        (click)="increment(item)"
                        class="flex size-9 items-center justify-center rounded-r-full text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
                        [attr.aria-label]="'Increase quantity of ' + item.product.name"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5" aria-hidden="true"><path fill-rule="evenodd" d="M10 4a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 10 4z" clip-rule="evenodd"/></svg>
                      </button>
                    </div>
                    <span class="text-base font-semibold text-neutral-900 dark:text-neutral-50">{{ lineTotal(item) }}</span>
                  </div>
                </div>
              </div>
            }
          </section>

          <!-- Order summary -->
          <aside class="lg:sticky lg:top-24 self-start">
            <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-card-dark">
              <h2 class="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">Order Summary</h2>

              <dl class="mt-5 space-y-3 text-sm">
                <div class="flex items-center justify-between">
                  <dt class="text-neutral-500 dark:text-neutral-400">Subtotal</dt>
                  <dd class="font-medium text-neutral-900 dark:text-neutral-100">{{ formatPrice(cart.total()) }}</dd>
                </div>
                <div class="flex items-center justify-between">
                  <dt class="text-neutral-500 dark:text-neutral-400">Shipping</dt>
                  <dd class="font-medium {{ shipping() === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-neutral-100' }}">
                    @if (shipping() === 0) { Free } @else { {{ formatPrice(shipping()) }} }
                  </dd>
                </div>
                <div class="flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
                  <dt class="font-semibold text-neutral-900 dark:text-neutral-50">Estimated total</dt>
                  <dd class="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">{{ formatPrice(grandTotal()) }}</dd>
                </div>
              </dl>

              <div class="mt-6">
                <app-button size="lg" [fullWidth]="true" (click)="proceedToCheckout()">Proceed to checkout</app-button>
              </div>

              <p class="mt-4 text-center text-xs text-neutral-400">
                @if (shipping() === 0) {
                  Free shipping applied · 30-day returns
                } @else {
                  Free shipping over {{ formatPrice(FREE_SHIPPING_THRESHOLD) }} · 30-day returns
                }
              </p>

              <a routerLink="/products" class="mt-4 block text-center text-sm font-medium text-primary-700 underline-offset-2 hover:underline dark:text-primary-300">
                Continue shopping
              </a>
            </div>
          </aside>
        </div>
      }
    </main>
  `,
})
export class CartComponent {
  readonly FREE_SHIPPING_THRESHOLD = FREE_SHIPPING_THRESHOLD;

  protected readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly imageService = inject(ImageService);

  readonly shipping = computed(() => shippingCost(this.cart.total()));
  readonly grandTotal = computed(() => this.cart.total() + this.shipping());

  formatPrice = formatPrice;

  image(product: ProductResponse): string {
    return this.imageService.product(product, 224);
  }

  lineTotal(item: CartItem): string {
    return formatPrice(item.product.price * item.quantity);
  }

  decrement(item: CartItem): void {
    this.cart.updateQuantity(item.product.id, item.quantity - 1);
  }

  increment(item: CartItem): void {
    this.cart.updateQuantity(item.product.id, item.quantity + 1);
  }

  proceedToCheckout(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/checkout']);
    } else {
      this.router.navigate(['/auth/login'], { queryParams: { redirect: '/checkout' } });
    }
  }
}
