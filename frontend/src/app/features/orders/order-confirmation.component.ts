import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

import { ShippingAddress } from '../../core/models/checkout';
import { OrderItemResponse, OrderResponse, OrderStatus } from '../../core/models/order';
import { ImageService } from '../../core/services/image.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { formatPrice } from '../../core/utils/format';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LinkButtonComponent } from '../../shared/components/button/link-button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  PENDING: 'primary',
  CONFIRMED: 'success',
  PAYMENT_FAILED: 'danger',
  CANCELLED: 'danger',
  SHIPPED: 'accent',
  DELIVERED: 'success',
};

const ORDER_STEPS = [
  { key: 'PENDING', label: 'Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
] as const;

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, BadgeComponent, ButtonComponent, LinkButtonComponent, SkeletonComponent],
  template: `
    <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      @if (loading()) {
        <div class="flex flex-col gap-4">
          <app-skeleton shape="h-24 w-full rounded-2xl" />
          <app-skeleton shape="h-64 w-full rounded-2xl" />
        </div>
      } @else if (!orderSignal()) {
        <div class="rounded-2xl border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
          <p class="font-display text-lg font-medium text-neutral-900 dark:text-neutral-100">Order not found</p>
          <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            It may not exist, or your session expired.
          </p>
          <div class="mt-6">
            <app-link-button routerLink="/products" variant="outline">Back to shop</app-link-button>
          </div>
        </div>
      } @else {
        @let order = orderSignal()!;
        <nav class="mb-8 text-sm text-neutral-500 dark:text-neutral-400" aria-label="Breadcrumb">
          <a routerLink="/" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Home</a>
          <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
          <span class="text-neutral-900 dark:text-neutral-50">Order #{{ order.id }}</span>
        </nav>

        <!-- Success header -->
        <div class="flex items-start gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-card-dark">
          <span class="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300">
            <svg viewBox="0 0 20 20" fill="currentColor" class="size-6" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l4.1 4.1 6.8-6.8a1 1 0 0 1 1.1 0z" clip-rule="evenodd"/>
            </svg>
          </span>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                Order confirmed
              </h1>
              <app-badge [tone]="statusTone(order.status)">{{ order.status }}</app-badge>
            </div>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Order #{{ order.id }} · {{ formatPrice(order.totalAmount) }} · Thank you for your purchase.
            </p>
          </div>
        </div>

        <!-- Status timeline -->
        @if (isTerminal(order.status)) {
          <div class="mt-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/40">
            <span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600 dark:bg-red-900/50 dark:text-red-400">!</span>
            <p class="text-sm text-red-700 dark:text-red-300">{{ terminalMessage(order.status) }}</p>
          </div>
        } @else {
          <ol class="mt-8 flex items-center" aria-label="Order status">
            @for (step of orderSteps; track step.key; let i = $index) {
              <li class="flex flex-1 items-center last:flex-none">
                <span class="flex items-center gap-2.5">
                  <span
                    class="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    [class]="stepDotClass(i)"
                  >
                    @if (i < statusIndex()) {
                      <svg viewBox="0 0 20 20" fill="currentColor" class="size-5" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l4.1 4.1 6.8-6.8a1 1 0 0 1 1.1 0z" clip-rule="evenodd"/>
                      </svg>
                    } @else {
                      {{ i + 1 }}
                    }
                  </span>
                  <span class="text-sm font-medium" [class]="stepLabelClass(i)">{{ step.label }}</span>
                </span>
                @if (!$last) {
                  <span class="mx-3 h-0.5 flex-1 rounded-full" [class]="stepConnectorClass(i)"></span>
                }
              </li>
            }
          </ol>
        }

        <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <!-- Items -->
          <section aria-label="Order items" class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 class="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">Items</h2>
            <ul class="mt-5 divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (item of order.items; track item.productId) {
                <li class="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <a [routerLink]="['/products', item.productId]" class="size-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    <img [src]="image(item)" [alt]="item.productName" class="size-16 object-cover" />
                  </a>
                  <div class="min-w-0 flex-1">
                    <a [routerLink]="['/products', item.productId]" class="block truncate font-medium text-neutral-900 hover:text-primary-700 dark:text-neutral-100 dark:hover:text-primary-300">
                      {{ item.productName }}
                    </a>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">
                      {{ item.quantity }} × {{ formatPrice(item.unitPrice) }}
                    </p>
                  </div>
                  <span class="font-semibold text-neutral-900 dark:text-neutral-50">{{ formatPrice(item.unitPrice * item.quantity) }}</span>
                </li>
              }
            </ul>

            <dl class="mt-5 space-y-3 border-t border-neutral-200 pt-5 text-sm dark:border-neutral-800">
              <div class="flex items-center justify-between">
                <dt class="text-neutral-500 dark:text-neutral-400">Subtotal</dt>
                <dd class="font-medium text-neutral-900 dark:text-neutral-100">{{ formatPrice(subtotal()) }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-neutral-500 dark:text-neutral-400">Shipping</dt>
                <dd class="font-medium {{ shipping() === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-neutral-100' }}">
                  @if (shipping() === 0) { Free } @else { {{ formatPrice(shipping()) }} }
                </dd>
              </div>
              <div class="flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
                <dt class="font-semibold text-neutral-900 dark:text-neutral-50">Total</dt>
                <dd class="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">{{ formatPrice(order.totalAmount) }}</dd>
              </div>
            </dl>
          </section>

          <!-- Sidebar -->
          <aside class="flex flex-col gap-6 self-start">
            @if (address()) {
              <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 class="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Shipping to</h2>
                <address class="mt-3 text-sm not-italic leading-relaxed text-neutral-900 dark:text-neutral-100">
                  {{ address()!.fullName }}<br />
                  {{ address()!.address1 }}<br />
                  @if (address()!.address2) {
                    {{ address()!.address2 }}<br />
                  }
                  {{ address()!.city }}, {{ address()!.state }} {{ address()!.zip }}<br />
                  {{ address()!.country }}
                </address>
              </div>
            }

            <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 class="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">What's next</h2>
              <p class="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                {{ nextStepText() }}
              </p>
              @if (order.status === 'CONFIRMED') {
                <div class="mt-5">
                  <app-button variant="outline" [fullWidth]="true" [busy]="cancelling()" (click)="cancelOrder()">
                    {{ confirmCancel() ? 'Confirm cancel' : 'Cancel order' }}
                  </app-button>
                </div>
              }
              <div class="mt-5">
                <app-link-button routerLink="/products" [fullWidth]="true">Continue shopping</app-link-button>
              </div>
            </div>
          </aside>
        </div>
      }
    </main>
  `,
})
export class OrderConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ordersService = inject(OrderService);
  private readonly imageService = inject(ImageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly orderSignal = signal<OrderResponse | null>(null);
  readonly address = signal<ShippingAddress | null>(null);

  readonly subtotal = computed(() =>
    this.orderSignal()?.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) ?? 0,
  );
  readonly shipping = computed(() =>
    this.orderSignal() ? this.orderSignal()!.totalAmount - this.subtotal() : 0,
  );

  readonly orderSteps = ORDER_STEPS;

  readonly cancelling = signal(false);
  readonly confirmCancel = signal(false);

  readonly statusIndex = computed(() => {
    const status = this.orderSignal()?.status;
    return status ? ORDER_STEPS.findIndex((s) => s.key === status) : -1;
  });

  readonly nextStepText = computed(() => {
    switch (this.orderSignal()?.status) {
      case 'PENDING':
        return "Payment is being processed. We'll confirm your order shortly.";
      case 'CONFIRMED':
        return "We're preparing your order. It will be shipped soon — you can cancel any time before it ships.";
      case 'SHIPPED':
        return 'Your order is on the way. You can track its progress above.';
      case 'DELIVERED':
        return 'Your order has been delivered. Enjoy your purchase!';
      case 'CANCELLED':
        return 'This order was cancelled.';
      case 'PAYMENT_FAILED':
        return 'Payment failed for this order. Please contact support if you were charged.';
      default:
        return 'Thank you for your purchase.';
    }
  });

  formatPrice = formatPrice;

  constructor() {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isInteger(id) || id <= 0) {
        this.router.navigate(['/products']);
        return;
      }
      this.ordersService.getById(id).pipe(take(1)).subscribe({
        next: (order) => {
          this.orderSignal.set(order);
          // Address comes from the persisted order (refresh-safe), not router state.
          this.address.set(order.shippingAddress ?? null);
          this.loading.set(false);
        },
        error: () => {
          this.orderSignal.set(null);
          this.loading.set(false);
        },
      });
    });
  }

  statusTone(status: OrderStatus): BadgeTone {
    return STATUS_TONE[status] ?? 'neutral';
  }

  isTerminal(status: OrderStatus): boolean {
    return status === 'CANCELLED' || status === 'PAYMENT_FAILED';
  }

  terminalMessage(status: OrderStatus): string {
    return status === 'PAYMENT_FAILED'
      ? 'Payment failed for this order. Please contact support if you were charged.'
      : 'This order was cancelled.';
  }

  stepDotClass(i: number): string {
    if (i < this.statusIndex()) return 'bg-emerald-500 text-white';
    if (i === this.statusIndex()) return 'bg-primary-600 text-white dark:bg-primary-500';
    return 'border border-neutral-300 bg-white text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400';
  }

  stepLabelClass(i: number): string {
    if (i < this.statusIndex()) return 'text-emerald-600 dark:text-emerald-400';
    if (i === this.statusIndex()) return 'font-semibold text-neutral-900 dark:text-neutral-50';
    return 'text-neutral-500 dark:text-neutral-400';
  }

  stepConnectorClass(i: number): string {
    return i < this.statusIndex() ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-800';
  }

  cancelOrder(): void {
    const order = this.orderSignal();
    if (!order || order.status !== 'CONFIRMED' || this.cancelling()) {
      return;
    }
    if (!this.confirmCancel()) {
      this.confirmCancel.set(true);
      return;
    }
    this.cancelling.set(true);
    this.ordersService.cancel(order.id).pipe(take(1)).subscribe({
      next: (updated) => {
        this.orderSignal.set(updated);
        this.cancelling.set(false);
        this.confirmCancel.set(false);
        this.toast.success('Order cancelled');
      },
      error: () => {
        this.cancelling.set(false);
        this.confirmCancel.set(false);
      },
    });
  }

  image(item: OrderItemResponse): string {
    return this.imageService.product({ id: item.productId, sku: '', imageUrl: item.imageUrl }, 128);
  }
}
