import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
// Coordinated, slightly desaturated palette (same lightness range) — donut + chart share it.
const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: '#7ba3c9',
  CONFIRMED: '#7ab98f',
  SHIPPED: '#6f8fc4',
  DELIVERED: '#4f9e76',
  CANCELLED: '#cf8b8b',
  PAYMENT_FAILED: '#d0a06a',
};
const ACCENT = '#7c9cc9';

interface TrendPoint { label: string; count: number }
interface StatusRow { status: OrderStatus; count: number }
interface DonutSegment { status: OrderStatus; count: number; color: string; dash: string; offset: string }
interface ChartPoint { x: number; y: number; label: string; count: number }

const CARD_CLASS =
  'rounded-lg border border-neutral-800 bg-neutral-900 p-5 shadow-lg shadow-black/10';

function pct(cur: number, prior: number): number | null {
  if (prior === 0) return cur === 0 ? null : 100;
  return ((cur - prior) / prior) * 100;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [RouterLink, SkeletonComponent],
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
      <div class="rounded-lg border border-dashed border-neutral-700 py-24 text-center">
        <p class="font-medium text-neutral-100">No data yet</p>
        <p class="mt-1 text-sm text-neutral-500">Orders and products will appear here once the store has activity.</p>
      </div>
    } @else {
      <!-- Stat cards -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="${CARD_CLASS}">
          <p class="text-xs font-medium uppercase tracking-widest text-neutral-500">Revenue</p>
          <p class="mt-2 text-2xl font-semibold tabular-nums text-neutral-50">{{ formatPrice(revenue()) }}</p>
          <span class="mt-1.5 inline-flex items-center gap-1 text-xs font-medium tabular-nums"
            [class.text-emerald-400]="(revenueDelta() ?? 0) >= 0"
            [class.text-rose-400]="(revenueDelta() ?? 0) < 0">
            @if (revenueDelta(); as d) {
              @if (d >= 0) {
                <svg viewBox="0 0 20 20" class="size-3" fill="currentColor" aria-hidden="true"><path d="M10 5l6 7H4l6-7Z" /></svg>
              } @else {
                <svg viewBox="0 0 20 20" class="size-3" fill="currentColor" aria-hidden="true"><path d="M10 15l-6-7h12l-6 7Z" /></svg>
              }
              {{ d >= 0 ? '+' : '' }}{{ d.toFixed(1) }}%
            } @else {
              <span class="text-neutral-600">No prior window</span>
            }
          </span>
        </div>
        <div class="${CARD_CLASS}">
          <p class="text-xs font-medium uppercase tracking-widest text-neutral-500">Orders</p>
          <p class="mt-2 text-2xl font-semibold tabular-nums text-neutral-50">{{ orderCount().toLocaleString() }}</p>
          <span class="mt-1.5 inline-flex items-center gap-1 text-xs font-medium tabular-nums"
            [class.text-emerald-400]="(orderDelta() ?? 0) >= 0"
            [class.text-rose-400]="(orderDelta() ?? 0) < 0">
            @if (orderDelta(); as d) {
              @if (d >= 0) {
                <svg viewBox="0 0 20 20" class="size-3" fill="currentColor" aria-hidden="true"><path d="M10 5l6 7H4l6-7Z" /></svg>
              } @else {
                <svg viewBox="0 0 20 20" class="size-3" fill="currentColor" aria-hidden="true"><path d="M10 15l-6-7h12l-6 7Z" /></svg>
              }
              {{ d >= 0 ? '+' : '' }}{{ d.toFixed(1) }}%
            } @else {
              <span class="text-neutral-600">No prior window</span>
            }
          </span>
        </div>
        <div class="${CARD_CLASS}">
          <p class="text-xs font-medium uppercase tracking-widest text-neutral-500">Avg order value</p>
          <p class="mt-2 text-2xl font-semibold tabular-nums text-neutral-50">{{ formatPrice(aov()) }}</p>
          <span class="mt-1.5 inline-flex items-center gap-1 text-xs font-medium tabular-nums"
            [class.text-emerald-400]="(aovDelta() ?? 0) >= 0"
            [class.text-rose-400]="(aovDelta() ?? 0) < 0">
            @if (aovDelta(); as d) {
              @if (d >= 0) {
                <svg viewBox="0 0 20 20" class="size-3" fill="currentColor" aria-hidden="true"><path d="M10 5l6 7H4l6-7Z" /></svg>
              } @else {
                <svg viewBox="0 0 20 20" class="size-3" fill="currentColor" aria-hidden="true"><path d="M10 15l-6-7h12l-6 7Z" /></svg>
              }
              {{ d >= 0 ? '+' : '' }}{{ d.toFixed(1) }}%
            } @else {
              <span class="text-neutral-600">No prior window</span>
            }
          </span>
        </div>
        <div class="${CARD_CLASS}">
          <p class="text-xs font-medium uppercase tracking-widest text-neutral-500">Top product</p>
          <p class="mt-2 truncate text-base font-semibold text-neutral-50">{{ topProduct()?.name ?? '—' }}</p>
          @if (topProduct(); as tp) {
            <p class="text-sm tabular-nums text-neutral-400">{{ formatPrice(tp.price) }}</p>
            <span class="mt-1.5 inline-flex items-center gap-1 text-xs font-medium tabular-nums"
              [class.text-emerald-400]="(topProductDelta() ?? 0) >= 0"
              [class.text-rose-400]="(topProductDelta() ?? 0) < 0">
              @if (topProductDelta(); as d) {
                @if (d >= 0) {
                  <svg viewBox="0 0 20 20" class="size-3" fill="currentColor" aria-hidden="true"><path d="M10 5l6 7H4l6-7Z" /></svg>
                } @else {
                  <svg viewBox="0 0 20 20" class="size-3" fill="currentColor" aria-hidden="true"><path d="M10 15l-6-7h12l-6 7Z" /></svg>
                }
                {{ d >= 0 ? '+' : '' }}{{ d.toFixed(1) }}%
              } @else {
                <span class="text-neutral-600">No prior window</span>
              }
            </span>
          }
        </div>
      </div>

      <!-- Charts -->
      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <!-- Orders over time (line chart) -->
        <section class="${CARD_CLASS}">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-neutral-500">Orders — last 14 days</h2>
          <div class="relative mt-4">
            <svg viewBox="0 0 560 160" class="w-full" role="img" aria-label="Order volume trend"
              (pointermove)="onChartMove($event)" (pointerleave)="hoverIndex.set(null)">
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" [attr.stop-color]="ACCENT" stop-opacity="0.18" />
                  <stop offset="100%" [attr.stop-color]="ACCENT" stop-opacity="0" />
                </linearGradient>
              </defs>
              <!-- Horizontal gridlines -->
              @for (g of gridLines(); track g.y) {
                <line [attr.x1]="LEFT" [attr.x2]="W - RIGHT" [attr.y1]="g.y" [attr.y2]="g.y" class="stroke-neutral-800" stroke-width="1" stroke-dasharray="3 3" />
              }
              <!-- Baseline -->
              <line [attr.x1]="LEFT" [attr.x2]="W - RIGHT" [attr.y1]="plotBottom()" [attr.y2]="plotBottom()" class="stroke-neutral-700" stroke-width="1" />
              <!-- Area + line -->
              <polygon [attr.points]="trendArea()" fill="url(#trendFill)" />
              <polyline [attr.points]="trendPoints()" fill="none" [attr.stroke]="ACCENT" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <!-- Data point markers -->
              @for (pt of chartPoints(); track $index) {
                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="2.5" [attr.fill]="ACCENT" />
              }
              @if (hoverPoint(); as hp) {
                <circle [attr.cx]="hp.x" [attr.cy]="hp.y" r="4.5" [attr.fill]="ACCENT" stroke="#0a0a0a" stroke-width="1.5" />
              }
              <!-- Y-axis min/max labels -->
              <text [attr.x]="LEFT - 6" [attr.y]="TOP + 3" text-anchor="end" class="fill-neutral-500 text-[10px]" aria-hidden="true">{{ chartMax() }}</text>
              <text [attr.x]="LEFT - 6" [attr.y]="plotBottom() + 3" text-anchor="end" class="fill-neutral-500 text-[10px]" aria-hidden="true">0</text>
            </svg>
            @if (hoverPoint(); as hp) {
              <div class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-md border border-neutral-700 bg-neutral-950 px-2.5 py-1.5 shadow-lg shadow-black/20"
                [style.left.%]="(hp.x / W) * 100" [style.top.%]="(hp.y / H) * 100">
                <p class="text-xs font-medium text-neutral-100">{{ hp.label }}</p>
                <p class="text-xs tabular-nums text-neutral-400">{{ hp.count }} order{{ hp.count === 1 ? '' : 's' }}</p>
              </div>
            }
          </div>
          <div class="mt-1 flex justify-between text-[10px] text-neutral-600">
            <span>{{ trend()[0]?.label }}</span>
            <span>{{ trend()[trend().length - 1]?.label }}</span>
          </div>
        </section>

        <!-- Status breakdown (donut chart) -->
        <section class="${CARD_CLASS}">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-neutral-500">Order status</h2>
          <div class="mt-4 flex items-center gap-6">
            <svg viewBox="0 0 100 100" class="size-40 shrink-0" role="img" aria-label="Order status breakdown">
              <circle cx="50" cy="50" r="40" fill="none" class="stroke-neutral-800" stroke-width="12" />
              @for (seg of donutSegments(); track seg.status) {
                <circle cx="50" cy="50" r="40" fill="none"
                  [attr.stroke]="seg.color" stroke-width="12"
                  [attr.stroke-dasharray]="seg.dash" [attr.stroke-dashoffset]="seg.offset"
                  transform="rotate(-90 50 50)" />
              }
              <text x="50" y="50" text-anchor="middle" dominant-baseline="central"
                class="fill-neutral-50 text-xl font-semibold">
                {{ orderCount() }}
              </text>
            </svg>
            <ul class="flex-1 space-y-2">
              @for (row of statusBreakdown(); track row.status) {
                <li class="flex items-center gap-2 text-sm">
                  <span class="size-2.5 rounded-sm shrink-0" [style.background]="STATUS_COLOR[row.status]"></span>
                  <span class="text-neutral-300">{{ row.status }}</span>
                  <span class="ml-auto tabular-nums text-neutral-50">{{ row.count }}</span>
                </li>
              }
            </ul>
          </div>
        </section>
      </div>

      <!-- Top products -->
      <section class="${CARD_CLASS}">
        <h2 class="text-xs font-semibold uppercase tracking-widest text-neutral-500">Top products by price</h2>
        <table class="mt-3 w-full text-sm">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wider text-neutral-500">
              <th class="py-2 pr-4 font-semibold">Product</th>
              <th class="py-2 pr-4 font-semibold">SKU</th>
              <th class="py-2 pr-4 font-semibold">Category</th>
              <th class="py-2 text-right font-semibold">Price</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-800">
            @for (product of topProducts(); track product.id) {
              <tr class="text-neutral-300 transition-colors hover:bg-neutral-800/40">
                <td class="py-2.5 pr-4 font-medium text-neutral-50">{{ product.name }}</td>
                <td class="py-2.5 pr-4 text-xs text-neutral-500">{{ product.sku }}</td>
                <td class="py-2.5 pr-4 text-neutral-400">{{ product.category.name }}</td>
                <td class="py-2.5 text-right tabular-nums font-semibold text-neutral-50">{{ formatPrice(product.price) }}</td>
              </tr>
            }
          </tbody>
        </table>
        <a routerLink="/admin/products"
          class="mt-3 inline-flex items-center gap-1 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-100">
          View all products
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="size-3.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15 12 10.5 7.5 6" />
          </svg>
        </a>
      </section>
    }
  `,
})
export class DashboardAdminComponent implements OnInit {
  private readonly ordersService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  // Chart geometry (viewBox units)
  readonly W = 560;
  readonly H = 160;
  readonly LEFT = 32;
  readonly RIGHT = 10;
  readonly TOP = 10;
  readonly BOTTOM = 10;

  readonly STATUS_COLOR = STATUS_COLOR;
  readonly ACCENT = ACCENT;
  formatPrice = formatPrice;

  readonly loading = signal(true);
  readonly orders = signal<OrderResponse[]>([]);
  readonly products = signal<ProductResponse[]>([]);
  readonly hoverIndex = signal<number | null>(null);

  readonly revenue = computed(() => this.orders().reduce((sum, o) => sum + o.totalAmount, 0));
  readonly orderCount = computed(() => this.orders().length);
  readonly aov = computed(() => (this.orderCount() ? this.revenue() / this.orderCount() : 0));
  readonly trend = computed<TrendPoint[]>(() => this.buildTrend(this.orders()));
  readonly statusBreakdown = computed<StatusRow[]>(() => this.buildStatusBreakdown(this.orders()));
  readonly donutSegments = computed<DonutSegment[]>(() => this.buildDonut(this.statusBreakdown()));
  readonly topProducts = computed(() => [...this.products()].sort((a, b) => b.price - a.price).slice(0, 5));
  readonly topProduct = computed(() => this.topProducts()[0] ?? null);

  // 14-day window deltas (current vs prior, same orders() signal — no extra API calls)
  readonly windows = computed(() => this.splitWindows(this.orders()));
  readonly revenueDelta = computed<number | null>(() => {
    const { cur, prior } = this.windows();
    return pct(this.sum(cur), this.sum(prior));
  });
  readonly orderDelta = computed<number | null>(() => {
    const { cur, prior } = this.windows();
    return pct(cur.length, prior.length);
  });
  readonly aovDelta = computed<number | null>(() => {
    const { cur, prior } = this.windows();
    return pct(this.average(cur), this.average(prior));
  });
  readonly topProductDelta = computed<number | null>(() => {
    const tp = this.topProduct();
    if (!tp) return null;
    const { cur, prior } = this.windows();
    return pct(this.countProductOrders(cur, tp.id), this.countProductOrders(prior, tp.id));
  });

  // Line-chart geometry
  readonly maxTrend = computed(() => Math.max(1, ...this.trend().map((p) => p.count)));
  readonly chartMax = computed(() => Math.max(5, Math.ceil(this.maxTrend() / 5) * 5));
  readonly chartPoints = computed<ChartPoint[]>(() => {
    const n = this.trend().length;
    return this.trend().map((p, i) => ({
      x: this.xFor(i, n),
      y: this.yFor(p.count, this.chartMax()),
      label: p.label,
      count: p.count,
    }));
  });
  readonly gridLines = computed(() => {
    const max = this.chartMax();
    return [0.25, 0.5, 0.75].map((f) => ({ y: this.yFor(max * f, max), value: Math.round(max * f) }));
  });
  readonly plotBottom = computed(() => this.yFor(0, this.chartMax()));
  readonly trendPoints = computed(() => this.chartPoints().map((p) => `${p.x},${p.y}`).join(' '));
  readonly trendArea = computed(() => {
    const pts = this.chartPoints();
    if (!pts.length) return '';
    return `${this.LEFT},${this.plotBottom()} ${pts.map((p) => `${p.x},${p.y}`).join(' ')} ${this.W - this.RIGHT},${this.plotBottom()}`;
  });
  readonly hoverPoint = computed<ChartPoint | null>(() => {
    const i = this.hoverIndex();
    return i === null ? null : this.chartPoints()[i] ?? null;
  });

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

  onChartMove(event: PointerEvent): void {
    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * this.W;
    let best = -1;
    let bestDist = Infinity;
    this.chartPoints().forEach((p, i) => {
      const d = Math.abs(p.x - px);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    this.hoverIndex.set(best);
  }

  private xFor(i: number, n: number): number {
    return this.LEFT + (n <= 1 ? 0 : (i / (n - 1)) * (this.W - this.LEFT - this.RIGHT));
  }

  private yFor(value: number, max: number): number {
    return this.TOP + (1 - value / max) * (this.H - this.TOP - this.BOTTOM);
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

  private splitWindows(orders: OrderResponse[]): { cur: OrderResponse[]; prior: OrderResponse[] } {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const DAY = 86_400_000;
    const curStart = todayStart - 13 * DAY;
    const priorStart = todayStart - 27 * DAY;
    const cur: OrderResponse[] = [];
    const prior: OrderResponse[] = [];
    for (const o of orders) {
      const t = new Date(o.createdAt).getTime();
      if (t >= curStart) cur.push(o);
      else if (t >= priorStart) prior.push(o);
    }
    return { cur, prior };
  }

  private sum(orders: OrderResponse[]): number {
    return orders.reduce((s, o) => s + o.totalAmount, 0);
  }

  private average(orders: OrderResponse[]): number {
    return orders.length ? this.sum(orders) / orders.length : 0;
  }

  private countProductOrders(orders: OrderResponse[], productId: number): number {
    return orders.filter((o) => o.items.some((i) => i.productId === productId)).length;
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
}
