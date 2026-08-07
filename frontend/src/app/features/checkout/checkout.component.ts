import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CartItem } from '../../core/models/cart';
import { ShippingAddress } from '../../core/models/checkout';
import { ProductResponse } from '../../core/models/product';
import { CartService } from '../../core/services/cart.service';
import { ImageService } from '../../core/services/image.service';
import { ToastService } from '../../core/services/toast.service';
import { formatPrice } from '../../core/utils/format';
import { FREE_SHIPPING_THRESHOLD, shippingCost } from '../../core/utils/shipping';
import { StorageService } from '../../core/utils/storage';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LinkButtonComponent } from '../../shared/components/button/link-button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

const ADDRESS_KEY = 'checkout.address';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, ButtonComponent, LinkButtonComponent, SkeletonComponent],
  template: `
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav class="mb-4 text-sm text-neutral-500 dark:text-neutral-400" aria-label="Breadcrumb">
        <a routerLink="/" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Home</a>
        <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
        <a routerLink="/cart" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Cart</a>
        <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
        <span class="text-neutral-900 dark:text-neutral-50">Checkout</span>
      </nav>

      <header class="mb-8">
        <p class="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">Almost there</p>
        <h1 class="mt-1 font-display text-3xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-4xl">
          Checkout
        </h1>
      </header>

      @if (cart.loading()) {
        <div class="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div class="flex flex-col gap-6">
            <app-skeleton shape="h-48 rounded-2xl" />
            <app-skeleton shape="h-48 rounded-2xl" />
          </div>
          <app-skeleton shape="h-96 rounded-2xl" />
        </div>
      } @else if (cart.items().length === 0) {
        <div class="flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 px-6 py-20 text-center dark:border-neutral-700">
          <h2 class="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            Nothing to check out yet
          </h2>
          <p class="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
            Your cart is empty. Add a few pieces to the collection before placing an order.
          </p>
          <div class="mt-7">
            <app-link-button routerLink="/products" size="lg">Continue shopping</app-link-button>
          </div>
        </div>
      } @else {
        <div class="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
          <!-- Forms -->
          <section class="flex flex-col gap-6">
            <form [formGroup]="addressForm" novalidate>
              <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 class="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">Shipping address</h2>
                <div class="mt-5 grid gap-4 sm:grid-cols-2">
                  <label class="sm:col-span-2">
                    <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Full name</span>
                    <input formControlName="fullName" type="text" autocomplete="name" placeholder="Alex Rivera"
                      class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50" />
                  </label>
                  <label class="sm:col-span-2">
                    <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Address</span>
                    <input formControlName="address1" type="text" autocomplete="address-line1" placeholder="Street address"
                      class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50" />
                  </label>
                  <label class="sm:col-span-2">
                    <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Apartment, suite (optional)</span>
                    <input formControlName="address2" type="text" autocomplete="address-line2" placeholder="Apt / Suite"
                      class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50" />
                  </label>
                  <label>
                    <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">City</span>
                    <input formControlName="city" type="text" autocomplete="address-level2" placeholder="City"
                      class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50" />
                  </label>
                  <label>
                    <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">State / Province</span>
                    <input formControlName="state" type="text" autocomplete="address-level1" placeholder="State"
                      class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50" />
                  </label>
                  <label>
                    <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">ZIP / Postal code</span>
                    <input formControlName="zip" type="text" autocomplete="postal-code" placeholder="ZIP code"
                      class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50" />
                  </label>
                  <label>
                    <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Country</span>
                    <input formControlName="country" type="text" autocomplete="country-name" placeholder="Country"
                      class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50" />
                  </label>
                </div>
              </div>
            </form>

            <form [formGroup]="paymentForm" novalidate>
              <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between gap-4">
                  <h2 class="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">Payment</h2>
                  <span class="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                    Demo — no real charge
                  </span>
                </div>
                <div class="mt-5 grid gap-4 sm:grid-cols-2">
                  <label class="sm:col-span-2">
                    <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Name on card</span>
                    <input formControlName="cardName" type="text" autocomplete="cc-name" placeholder="Alex Rivera"
                      class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50" />
                  </label>
                  <label class="sm:col-span-2">
                    <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Card number</span>
                    <input formControlName="cardNumber" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000"
                      class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50" />
                  </label>
                  <label>
                    <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Expiry</span>
                    <input formControlName="expiry" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY"
                      class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50" />
                  </label>
                  <label>
                    <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">CVC</span>
                    <input formControlName="cvc" type="text" inputmode="numeric" autocomplete="cc-csc" placeholder="123"
                      class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50" />
                  </label>
                </div>
              </div>
            </form>
          </section>

          <!-- Order summary -->
          <aside class="lg:sticky lg:top-24 self-start">
            <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-card-dark">
              <h2 class="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">Order Summary</h2>

              <ul class="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
                @for (item of cart.items(); track item.product.id) {
                  <li class="flex items-center gap-4">
                    <a [routerLink]="['/products', item.product.id]" class="relative block size-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                      <img [src]="image(item.product)" [alt]="item.product.name" class="size-14 object-cover" />
                      <span class="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                        {{ item.quantity }}
                      </span>
                    </a>
                    <div class="min-w-0 flex-1">
                      <a [routerLink]="['/products', item.product.id]" class="block truncate text-sm font-medium text-neutral-900 hover:text-primary-700 dark:text-neutral-100 dark:hover:text-primary-300">
                        {{ item.product.name }}
                      </a>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ formatPrice(item.product.price) }} each</p>
                    </div>
                    <span class="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{{ lineTotal(item) }}</span>
                  </li>
                }
              </ul>

              <dl class="mt-5 space-y-3 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-800">
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
                  <dt class="font-semibold text-neutral-900 dark:text-neutral-50">Total</dt>
                  <dd class="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">{{ formatPrice(grandTotal()) }}</dd>
                </div>
              </dl>

              <div class="mt-6">
                <app-button
                  size="lg"
                  [fullWidth]="true"
                  [busy]="placing()"
                  [disabled]="placing() || addressForm.invalid || paymentForm.invalid"
                  (click)="placeOrder()"
                >
                  Place order · {{ formatPrice(grandTotal()) }}
                </app-button>
              </div>

              <p class="mt-4 text-center text-xs text-neutral-400">
                @if (shipping() === 0) {
                  Free shipping applied · 30-day returns
                } @else {
                  Free shipping over {{ formatPrice(FREE_SHIPPING_THRESHOLD) }} · 30-day returns
                }
              </p>

              <a routerLink="/cart" class="mt-4 block text-center text-sm font-medium text-primary-700 underline-offset-2 hover:underline dark:text-primary-300">
                Back to cart
              </a>
            </div>
          </aside>
        </div>
      }
    </main>
  `,
})
export class CheckoutComponent {
  readonly FREE_SHIPPING_THRESHOLD = FREE_SHIPPING_THRESHOLD;

  protected readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly imageService = inject(ImageService);
  private readonly storage = inject(StorageService);
  private readonly toast = inject(ToastService);

  readonly placing = signal(false);

  readonly shipping = computed(() => shippingCost(this.cart.total()));
  readonly grandTotal = computed(() => this.cart.total() + this.shipping());

  readonly addressForm = new FormGroup({
    fullName: new FormControl('', Validators.required),
    address1: new FormControl('', Validators.required),
    address2: new FormControl(''),
    city: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    zip: new FormControl('', Validators.required),
    country: new FormControl('United States', Validators.required),
  });

  readonly paymentForm = new FormGroup({
    cardName: new FormControl('', Validators.required),
    cardNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{16}$/)]),
    expiry: new FormControl('', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]),
    cvc: new FormControl('', [Validators.required, Validators.pattern(/^\d{3,4}$/)]),
  });

  formatPrice = formatPrice;

  constructor() {
    const saved = this.storage.getObject<ShippingAddress>(ADDRESS_KEY);
    if (saved) {
      this.addressForm.patchValue(saved);
    }
  }

  image(product: ProductResponse): string {
    return this.imageService.product(product, 96);
  }

  lineTotal(item: CartItem): string {
    return formatPrice(item.product.price * item.quantity);
  }

  placeOrder(): void {
    if (this.placing() || this.addressForm.invalid || this.paymentForm.invalid) {
      return;
    }
    this.placing.set(true);
    const address = this.addressForm.getRawValue() as ShippingAddress;
    this.storage.setObject(ADDRESS_KEY, address);

    this.cart.checkout(address).subscribe({
      next: (result) => {
        this.placing.set(false);
        // Address persists on the order server-side; confirmation reads it from the API.
        this.router.navigate(['/orders', result.orderId]);
      },
      error: () => {
        this.placing.set(false);
        this.toast.error('Could not place your order. Please try again.');
      },
    });
  }
}
