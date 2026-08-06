import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, take } from 'rxjs';

import { OrderResponse, OrderStatus } from '../../core/models/order';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { formatDate, formatPrice } from '../../core/utils/format';
import { BadgeComponent, BadgeTone } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

type SortKey = 'id' | 'createdAt' | 'totalAmount';

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
        <div class="flex flex-col gap-4">
          <app-skeleton shape="h-16 w-full rounded-lg" />
          <app-skeleton shape="h-16 w-full rounded-lg" />
          <app-skeleton shape="h-16 w-full rounded-lg" />
        </div>
      } @else {
        <div class="flex flex-wrap items-center gap-3">
          <input #search type="search" placeholder="Search order # or customer…"
            (input)="query.set(search.value); resetPage()"
            class="w-64 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
          <select #status (change)="onStatusChange(status.value)"
            class="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100">
            @for (opt of statusOptions; track opt) {
              <option [value]="opt">{{ opt === 'ALL' ? 'All statuses' : opt }}</option>
            }
          </select>
          <div class="flex items-center gap-2">
            <input #from type="date" (change)="dateFrom.set(from.value); resetPage()" title="From date"
              class="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
            <span class="text-xs text-neutral-500">to</span>
            <input #to type="date" (change)="dateTo.set(to.value); resetPage()" title="To date"
              class="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
          </div>
        </div>

        @if (paged().length === 0) {
          <div class="rounded-lg border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
            <p class="font-medium text-neutral-900 dark:text-neutral-50">No orders match your filters</p>
            <p class="mt-1 text-sm text-neutral-500">Try adjusting the search or filters above.</p>
          </div>
        } @else {
          <div class="overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  <th class="px-5 py-4 font-semibold">
                    <button type="button" (click)="sortBy('id')" class="inline-flex items-center gap-1 uppercase tracking-wider hover:text-neutral-900 dark:hover:text-neutral-50">
                      Order {{ sortIndicator('id') }}
                    </button>
                  </th>
                  <th class="px-5 py-4 font-semibold">Customer</th>
                  <th class="px-5 py-4 font-semibold">
                    <button type="button" (click)="sortBy('createdAt')" class="inline-flex items-center gap-1 uppercase tracking-wider hover:text-neutral-900 dark:hover:text-neutral-50">
                      Placed {{ sortIndicator('createdAt') }}
                    </button>
                  </th>
                  <th class="px-5 py-4 font-semibold">Items</th>
                  <th class="px-5 py-4 text-right font-semibold">
                    <button type="button" (click)="sortBy('totalAmount')" class="inline-flex items-center gap-1 uppercase tracking-wider hover:text-neutral-900 dark:hover:text-neutral-50">
                      Total {{ sortIndicator('totalAmount') }}
                    </button>
                  </th>
                  <th class="px-5 py-4 font-semibold">Status</th>
                  <th class="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
              @for (order of paged(); track order.id) {
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
          <div class="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
            <span>Showing {{ paged().length }} of {{ sorted().length }} order{{ sorted().length === 1 ? '' : 's' }}</span>
            <div class="flex items-center gap-1">
              <app-button size="sm" variant="outline" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Prev</app-button>
              <span class="px-2 tabular-nums text-neutral-900 dark:text-neutral-50">Page {{ page() }} / {{ pageCount() }}</span>
              <app-button size="sm" variant="outline" [disabled]="page() >= pageCount()" (click)="page.set(page() + 1)">Next</app-button>
            </div>
          </div>
        }
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

  readonly query = signal('');
  readonly statusFilter = signal<'ALL' | OrderStatus>('ALL');
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
  readonly sortKey = signal<SortKey>('createdAt');
  readonly sortDir = signal<'asc' | 'desc'>('desc');
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly statusOptions: ('ALL' | OrderStatus)[] = [
    'ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PAYMENT_FAILED',
  ];

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    const status = this.statusFilter();
    const from = this.dateFrom() ? new Date(this.dateFrom()).getTime() : null;
    const to = this.dateTo() ? new Date(this.dateTo()).getTime() + 86_400_000 : null;
    return this.orders().filter((o) => {
      if (status !== 'ALL' && o.status !== status) return false;
      const placed = new Date(o.createdAt).getTime();
      if (from && placed < from) return false;
      if (to && placed >= to) return false;
      if (q && !String(o.id).includes(q) && !(o.customerName ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
  });

  readonly sorted = computed(() => {
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    const key = this.sortKey();
    return [...this.filtered()].sort((a, b) => {
      if (key === 'id') return (a.id - b.id) * dir;
      if (key === 'totalAmount') return (a.totalAmount - b.totalAmount) * dir;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
    });
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.sorted().length / this.pageSize)));
  readonly paged = computed(() => {
    const safePage = Math.min(this.page(), this.pageCount());
    const start = (safePage - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
  });

  formatPrice = formatPrice;
  formatDate = formatDate;

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('desc');
    }
    this.page.set(1);
  }

  sortIndicator(key: SortKey): string {
    if (this.sortKey() !== key) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  resetPage(): void {
    this.page.set(1);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value as 'ALL' | OrderStatus);
    this.page.set(1);
  }

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
