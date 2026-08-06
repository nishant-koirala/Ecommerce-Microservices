import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, take } from 'rxjs';

import { OrderResponse, OrderStatus } from '../../core/models/order';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { formatDate, formatPrice } from '../../core/utils/format';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
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
  selector: 'app-orders-admin',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, SkeletonComponent],
  template: `
    <div class="space-y-4">
      @if (loading()) {
        <div class="mt-8 flex flex-col gap-4">
          <app-skeleton shape="h-16 w-full rounded-2xl" />
          <app-skeleton shape="h-16 w-full rounded-2xl" />
          <app-skeleton shape="h-16 w-full rounded-2xl" />
        </div>
      } @else if (orders().length === 0) {
        <div class="mt-8 rounded-2xl border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
          <p class="font-display text-lg font-medium text-neutral-900 dark:text-neutral-100">No orders yet</p>
        </div>
      } @else {
        <div class="mt-8 overflow-x-auto rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <th class="px-5 py-4 font-semibold">Order</th>
                <th class="px-5 py-4 font-semibold">Customer</th>
                <th class="px-5 py-4 font-semibold">Placed</th>
                <th class="px-5 py-4 font-semibold">Items</th>
                <th class="px-5 py-4 text-right font-semibold">Total</th>
                <th class="px-5 py-4 font-semibold">Status</th>
                <th class="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
              @for (order of orders(); track order.id) {
                <tr class="text-neutral-700 dark:text-neutral-200">
                  <td class="px-5 py-4 font-medium text-neutral-900 dark:text-neutral-50">#{{ order.id }}</td>
                  <td class="px-5 py-4">{{ order.customerName ?? 'Customer #' + order.userId }}</td>
                  <td class="px-5 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400">{{ formatDate(order.createdAt) }}</td>
                  <td class="px-5 py-4">{{ itemCount(order) }}</td>
                  <td class="px-5 py-4 text-right font-semibold text-neutral-900 dark:text-neutral-50">{{ formatPrice(order.totalAmount) }}</td>
                  <td class="px-5 py-4">
                    <app-badge [tone]="statusTone(order.status)">{{ order.status }}</app-badge>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex justify-end gap-2">
                      @if (order.status === 'CONFIRMED') {
                        <app-button size="sm" variant="outline" [busy]="busyId() === order.id" (click)="ship(order)">Ship</app-button>
                      }
                      @if (order.status === 'SHIPPED') {
                        <app-button size="sm" variant="outline" [busy]="busyId() === order.id" (click)="deliver(order)">Deliver</app-button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class OrdersAdminComponent implements OnInit {
  private readonly ordersService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly orders = signal<OrderResponse[]>([]);
  readonly busyId = signal<number | null>(null);

  formatPrice = formatPrice;
  formatDate = formatDate;

  ngOnInit(): void {
    this.ordersService
      .listAll()
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

  itemCount(order: OrderResponse): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  ship(order: OrderResponse): void {
    this.transition(order, () => this.ordersService.ship(order.id), 'Order #' + order.id + ' shipped');
  }

  deliver(order: OrderResponse): void {
    this.transition(order, () => this.ordersService.deliver(order.id), 'Order #' + order.id + ' delivered');
  }

  private transition(order: OrderResponse, call: () => Observable<OrderResponse>, message: string): void {
    if (this.busyId() !== null) {
      return;
    }
    this.busyId.set(order.id);
    call()
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe({
        next: (updated) => {
          this.orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o)));
          this.busyId.set(null);
          this.toast.success(message);
        },
        error: () => {
          this.busyId.set(null);
        },
      });
  }
}
