import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, take } from 'rxjs';

import { OrderResponse, OrderStatus } from '../../core/models/order';
import { ProductResponse } from '../../core/models/product';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { formatPrice } from '../../core/utils/format';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

const STATUS_ORDER: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PAYMENT_FAILED'];
const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: '#0ea5e9',
  CONFIRMED: '#22c55e',
  SHIPPED: '#3b82f6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
  PAYMENT_FAILED: '#f59e0b',
};

interface TrendPoint { label: string; count: number }
interface StatusRow { status: OrderStatus; count: number }
interface DonutSegment { status: OrderStatus; count: number; color: string; dash: string; offset: string }

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    @if (loading()) {
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        @for (_ of [1, 2, 3, 4]; track $index) {
          <app-skeleton shape="h-28 w-full rounded-lg" />
        }
      </div>
      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <app-skeleton shape="h-72 w-full rounded-lg" />
        <app-skeleton shape="h-72 w-full rounded-lg" />
      </div>
    } @else if (orderCount() === 0 && products().length === 0) {
      <div class="rounded-lg border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
        <p class="font-medium text-neutral-900">No data yet</p>
        <p class="mt-1 text-sm text-neutral-500">Orders and products will appear here once the store has activity.</p>
      </div>
    } @else {
      <!-- Stat cards -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p class="text-xs font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Revenue</p>
          <p class="mt-2 text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">{{ formatPrice(revenue()) }}</p>
        </div>
        <div class="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p class="text-xs font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Orders</p>
          <p class="mt-2 text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">{{ orderCount().toLocaleString() }}</p>
        </div>
        <div class="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p class="text-xs font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Avg order value</p>
          <p class="mt-2 text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">{{ formatPrice(aov()) }}</p>
        </div>
        <div class="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p class="text-xs font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Top product</p>
          <p class="mt-2 truncate text-base font-semibold text-neutral-900 dark:text-neutral-50">{{ topProduct()?.name ?? '—' }}</p>
          @if (topProduct(); as tp) {
            <p class="text-sm tabular-nums text-neutral-500 dark:text-neutral-400">{{ formatPrice(tp.price) }}</p>
          }
        </div>
      </div>

      <!-- Charts -->
      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <!-- Orders over time (line chart) -->
        <section class="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Orders — last 14 days</h2>
          <svg viewBox="0 0 560 160" class="mt-4 w-full" role="img" aria-label="Order volume trend">
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18" />
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
              </linearGradient>
            </defs>
            <polygon [attr.points]="trendArea()" fill="url(#trendFill)" />
            <polyline [attr.points]="trendPoints()" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="mt-1 flex justify-between text-[10px] text-neutral-400">
            <span>{{ trend()[0]?.label }}</span>
            <span>{{ trend()[trend().length - 1]?.label }}</span>
          </div>
        </section>

        <!-- Status breakdown (donut chart) -->
        <section class="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Order status</h2>
          <div class="mt-4 flex items-center gap-6">
            <svg viewBox="0 0 100 100" class="size-40 shrink-0" role="img" aria-label="Order status breakdown">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e7e5e4" stroke-width="12" />
              @for (seg of donutSegments(); track seg.status) {
                <circle cx="50" cy="50" r="40" fill="none"
                  [attr.stroke]="seg.color" stroke-width="12"
                  [attr.stroke-dasharray]="seg.dash" [attr.stroke-dashoffset]="seg.offset"
                  transform="rotate(-90 50 50)" />
              }
              <text x="50" y="50" text-anchor="middle" dominant-baseline="central"
                class="fill-neutral-900 text-xl font-semibold dark:fill-neutral-50">
                {{ orderCount() }}
              </text>
            </svg>
            <ul class="flex-1 space-y-2">
              @for (row of statusBreakdown(); track row.status) {
                <li class="flex items-center gap-2 text-sm">
                  <span class="size-2.5 rounded-sm shrink-0" [style.background]="STATUS_COLOR[row.status]"></span>
                  <span class="text-neutral-600 dark:text-neutral-300">{{ row.status }}</span>
                  <span class="ml-auto tabular-nums text-neutral-900 dark:text-neutral-50">{{ row.count }}</span>
                </li>
              }
            </ul>
          </div>
        </section>
      </div>

      <!-- Top products -->
      <section class="mt-6 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 class="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Top products by price</h2>
        <table class="mt-3 w-full text-sm">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <th class="py-2 pr-4 font-semibold">Product</th>
              <th class="py-2 pr-4 font-semibold">SKU</th>
              <th class="py-2 pr-4 font-semibold">Category</th>
              <th class="py-2 text-right font-semibold">Price</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
            @for (product of topProducts(); track product.id) {
              <tr class="text-neutral-700 dark:text-neutral-200">
                <td class="py-2.5 pr-4 font-medium text-neutral-900 dark:text-neutral-50">{{ product.name }}</td>
                <td class="py-2.5 pr-4 text-xs text-neutral-500 dark:text-neutral-400">{{ product.sku }}</td>
                <td class="py-2.5 pr-4 text-neutral-600 dark:text-neutral-300">{{ product.category.name }}</td>
                <td class="py-2.5 text-right tabular-nums font-semibold text-neutral-900 dark:text-neutral-50">{{ formatPrice(product.price) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    }
  `,
})
export class DashboardAdminComponent implements OnInit {
  private readonly ordersService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly STATUS_COLOR = STATUS_COLOR;
  formatPrice = formatPrice;

  readonly loading = signal(true);
  readonly orders = signal<OrderResponse[]>([]);
  readonly products = signal<ProductResponse[]>([]);

  readonly revenue = computed(() => this.orders().reduce((sum, o) => sum + o.totalAmount, 0));
  readonly orderCount = computed(() => this.orders().length);
  readonly aov = computed(() => (this.orderCount() ? this.revenue() / this.orderCount() : 0));
  readonly trend = computed<TrendPoint[]>(() => this.buildTrend(this.orders()));
  readonly statusBreakdown = computed<StatusRow[]>(() => this.buildStatusBreakdown(this.orders()));
  readonly donutSegments = computed<DonutSegment[]>(() => this.buildDonut(this.statusBreakdown()));
  readonly topProducts = computed(() => [...this.products()].sort((a, b) => b.price - a.price).slice(0, 5));
  readonly topProduct = computed(() => this.topProducts()[0] ?? null);

  readonly maxTrend = computed(() => Math.max(1, ...this.trend().map((p) => p.count)));
  readonly trendPoints = computed(() => this.linePoints(this.trend(), this.maxTrend()));
  readonly trendArea = computed(() => this.areaPoints(this.trend(), this.maxTrend()));

  ngOnInit(): void {
    forkJoin({
      orders: this.ordersService.listAll(),
      products: this.productService.getAll(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe({
        next: ({ orders, products }) => {
          this.orders.set(orders);
          this.products.set(products);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toast.error('Could not load dashboard data.');
        },
      });
  }

  private buildTrend(orders: OrderResponse[]): TrendPoint[] {
    const today = new Date();
    const days: { key: string; label: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
      });
    }
    const counts = new Map<string, number>();
    for (const o of orders) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return days.map(({ key, label }) => ({ label, count: counts.get(key) ?? 0 }));
  }

  private buildStatusBreakdown(orders: OrderResponse[]): StatusRow[] {
    const counts = new Map<OrderStatus, number>();
    for (const o of orders) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
    return STATUS_ORDER.map((status) => ({ status, count: counts.get(status) ?? 0 }));
  }

  private buildDonut(rows: StatusRow[]): DonutSegment[] {
    const total = rows.reduce((sum, r) => sum + r.count, 0);
    if (total === 0) return [];
    const circumference = 2 * Math.PI * 40;
    let cumulative = 0;
    return rows
      .filter((r) => r.count > 0)
      .map((r) => {
        const length = (r.count / total) * circumference;
        const segment: DonutSegment = {
          status: r.status,
          count: r.count,
          color: STATUS_COLOR[r.status],
          dash: `${length} ${circumference - length}`,
          offset: `${-cumulative}`,
        };
        cumulative += length;
        return segment;
      });
  }

  private linePoints(trend: TrendPoint[], max: number): string {
    const W = 560, H = 160, PAD = 8;
    if (trend.length <= 1) return `${PAD},${H - PAD}`;
    return trend
      .map((p, i) => {
        const x = PAD + (i / (trend.length - 1)) * (W - PAD * 2);
        const y = H - PAD - (p.count / max) * (H - PAD * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  private areaPoints(trend: TrendPoint[], max: number): string {
    const W = 560, H = 160, PAD = 8;
    if (trend.length === 0) return '';
    const points = trend.map((p, i) => {
      const x = PAD + (i / (trend.length - 1)) * (W - PAD * 2);
      const y = H - PAD - (p.count / max) * (H - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `${PAD},${H - PAD} ${points.join(' ')} ${W - PAD},${H - PAD}`;
  }
}
