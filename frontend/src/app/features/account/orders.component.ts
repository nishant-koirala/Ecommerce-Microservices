import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { OrderItemResponse, OrderResponse, OrderStatus } from '../../core/models/order';
import { AuthService } from '../../core/services/auth.service';
import { ImageService } from '../../core/services/image.service';
import { OrderService } from '../../core/services/order.service';
import { formatDate, formatPrice } from '../../core/utils/format';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
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

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, BadgeComponent, LinkButtonComponent, SkeletonComponent],
  template: `
    <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav class="mb-8 text-sm text-neutral-500 dark:text-neutral-400" aria-label="Breadcrumb">
        <a routerLink="/" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Home</a>
        <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
        <span class="text-neutral-900 dark:text-neutral-50">My orders</span>
      </nav>

      <h1 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
        My orders
      </h1>

      @if (loading()) {
        <div class="mt-8 flex flex-col gap-4">
          <app-skeleton shape="h-24 w-full rounded-2xl" />
          <app-skeleton shape="h-24 w-full rounded-2xl" />
          <app-skeleton shape="h-24 w-full rounded-2xl" />
        </div>
      } @else if (orders().length === 0) {
        <div class="mt-8 rounded-2xl border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
          <p class="font-display text-lg font-medium text-neutral-900 dark:text-neutral-100">No orders yet</p>
          <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            When you place an order, it will show up here.
          </p>
          <div class="mt-6">
            <app-link-button routerLink="/products" variant="outline">Start shopping</app-link-button>
          </div>
        </div>
      } @else {
        <ul class="mt-8 space-y-4">
          @for (order of orders(); track order.id) {
            <li>
              <a
                [routerLink]="['/orders', order.id]"
                class="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-primary-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary-600"
              >
                <div class="flex min-w-0 items-center gap-4">
                  @if (order.items.length > 0) {
                    <span class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                      <img [src]="image(order.items[0])" [alt]="order.items[0].productName" class="size-12 object-cover" />
                    </span>
                  }
                  <div class="min-w-0">
                    <p class="truncate font-medium text-neutral-900 dark:text-neutral-50">Order #{{ order.id }}</p>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">
                      {{ formatDate(order.createdAt) }} · {{ order.items.length }}
                      {{ order.items.length === 1 ? 'item' : 'items' }}
                    </p>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-3">
                  <app-badge [tone]="statusTone(order.status)">{{ order.status }}</app-badge>
                  <span class="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                    {{ formatPrice(order.totalAmount) }}
                  </span>
                </div>
              </a>
            </li>
          }
        </ul>
      }
    </main>
  `,
})
export class OrdersComponent implements OnInit {
  private readonly ordersService = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly imageService = inject(ImageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly orders = signal<OrderResponse[]>([]);

  formatPrice = formatPrice;
  formatDate = formatDate;

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }
    this.ordersService
      .getByUser(userId)
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe({
        next: (orders) => {
          this.orders.set(orders);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  statusTone(status: OrderStatus): BadgeTone {
    return STATUS_TONE[status] ?? 'neutral';
  }

  image(item: OrderItemResponse): string {
    return this.imageService.product({ id: item.productId, sku: '', imageUrl: item.imageUrl }, 128);
  }
}
