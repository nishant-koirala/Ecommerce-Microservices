import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

import { CategoryResponse, ProductResponse } from '../../core/models/product';
import { PlatformService } from '../../core/services/platform.service';
import { ProductService } from '../../core/services/product.service';
import { isSortOption, deriveCategories, sortProducts, SortOption } from '../../core/utils/products';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-products-listing',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, ButtonComponent, SkeletonComponent],
  template: `
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav class="mb-4 text-sm text-neutral-500 dark:text-neutral-400" aria-label="Breadcrumb">
        <a routerLink="/" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Home</a>
        <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
        <span class="text-neutral-700 dark:text-neutral-200">Shop</span>
        @if (activeCategory()) {
          <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
          <span class="text-neutral-900 dark:text-neutral-50">{{ activeCategory()!.name }}</span>
        }
      </nav>

      <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
            Products
          </p>
          <h1 class="mt-1 font-display text-3xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-4xl">
            {{ activeCategory()?.name ?? 'All products' }}
          </h1>
          <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            @if (search()) {
              Results for <span class="font-medium text-neutral-700 dark:text-neutral-200">“{{ search() }}”</span> · {{ totalItems() }} item{{ totalItems() === 1 ? '' : 's' }}
            } @else {
              {{ totalItems() }} item{{ totalItems() === 1 ? '' : 's' }}
            }
          </p>
        </div>

        <div class="flex items-center gap-2 text-sm">
          <span class="hidden text-neutral-500 dark:text-neutral-400 sm:block">Sort by</span>
          <select
            [value]="sort()"
            (change)="onSortChange($event)"
            class="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A–Z</option>
          </select>
        </div>
      </header>

      @if (hasActiveFilters()) {
        <div class="mb-8 flex flex-wrap items-center gap-2">
          <span class="text-xs font-medium uppercase tracking-wider text-neutral-400">Filters:</span>
          @if (activeCategory()) {
            <button
              type="button"
              (click)="clearCategory()"
              class="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800 transition-colors hover:bg-primary-200 dark:bg-primary-900/60 dark:text-primary-200 dark:hover:bg-primary-900"
            >
              {{ activeCategory()!.name }}
              <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5" aria-hidden="true">
                <path fill-rule="evenodd" d="M6.28 5.22a.75.75 0 0 1 1.06 0L10 7.94l2.66-2.72a.75.75 0 1 1 1.08 1.04L11.06 9l2.68 2.74a.75.75 0 1 1-1.08 1.04L10 10.06l-2.66 2.72a.75.75 0 0 1-1.08-1.04L8.94 9 6.26 6.26a.75.75 0 0 1 0-1.04z" clip-rule="evenodd"/>
              </svg>
            </button>
          }
          @if (search()) {
            <button
              type="button"
              (click)="clearSearch()"
              class="inline-flex items-center gap-1.5 rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              “{{ search() }}”
              <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5" aria-hidden="true">
                <path fill-rule="evenodd" d="M6.28 5.22a.75.75 0 0 1 1.06 0L10 7.94l2.66-2.72a.75.75 0 1 1 1.08 1.04L11.06 9l2.68 2.74a.75.75 0 1 1-1.08 1.04L10 10.06l-2.66 2.72a.75.75 0 0 1-1.08-1.04L8.94 9 6.26 6.26a.75.75 0 0 1 0-1.04z" clip-rule="evenodd"/>
              </svg>
            </button>
          }
          <button type="button" (click)="clearFilters()" class="text-xs font-medium text-primary-700 underline-offset-2 hover:underline dark:text-primary-300">
            Clear all
          </button>
        </div>
      }

      <div class="grid gap-8 lg:grid-cols-[240px_1fr]">
        <!-- Category rail (mobile) -->
        <aside class="lg:hidden">
          <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <a
              [routerLink]="[]"
              [queryParams]="{ categoryId: null, page: null }"
              queryParamsHandling="merge"
              class="shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors {{ categoryId() === null ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950' : 'border-neutral-300 text-neutral-600 hover:border-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-300' }}"
            >
              All
            </a>
            @for (category of categories(); track category.id) {
              <a
                [routerLink]="[]"
                [queryParams]="{ categoryId: category.id, page: null }"
                queryParamsHandling="merge"
                class="shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors {{ categoryId() === category.id ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950' : 'border-neutral-300 text-neutral-600 hover:border-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-300' }}"
              >
                {{ category.name }}
              </a>
            }
          </div>
        </aside>

        <!-- Category sidebar (desktop) -->
        <aside class="hidden lg:block">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-neutral-400">Categories</h2>
          <ul class="mt-4 space-y-1">
            <li>
              <a
                [routerLink]="[]"
                [queryParams]="{ categoryId: null, page: null }"
                queryParamsHandling="merge"
                class="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors {{ categoryId() === null ? 'bg-primary-50 font-semibold text-primary-800 dark:bg-primary-950/60 dark:text-primary-200' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100' }}"
              >
                <span>All products</span>
                <span class="text-xs text-neutral-400">{{ catalogCount() }}</span>
              </a>
            </li>
            @for (category of categories(); track category.id) {
              <li>
                <a
                  [routerLink]="[]"
                  [queryParams]="{ categoryId: category.id, page: null }"
                  queryParamsHandling="merge"
                  class="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors {{ categoryId() === category.id ? 'bg-primary-50 font-semibold text-primary-800 dark:bg-primary-950/60 dark:text-primary-200' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100' }}"
                >
                  <span>{{ category.name }}</span>
                  <span class="text-xs text-neutral-400">{{ categoryCount(category.id) }}</span>
                </a>
              </li>
            }
          </ul>
        </aside>

        <!-- Product grid -->
        <section aria-label="Product list">
          @if (loading()) {
            <div class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
              @for (i of [1, 2, 3, 4, 5, 6]; track i) {
                <div class="flex flex-col gap-3">
                  <app-skeleton shape="aspect-square w-full rounded-2xl" />
                  <app-skeleton shape="h-4 w-2/3" />
                  <app-skeleton shape="h-4 w-1/3" />
                </div>
              }
            </div>
          } @else if (paginated().length === 0) {
            <div class="rounded-2xl border border-dashed border-neutral-300 py-20 text-center dark:border-neutral-700">
              <p class="font-display text-lg font-medium text-neutral-900 dark:text-neutral-100">
                No products found
              </p>
              <p class="mx-auto mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                @if (hasActiveFilters()) {
                  We couldn't match anything with the current filters. Try a different category or search term.
                } @else {
                  The catalog is empty right now. Check back soon.
                }
              </p>
              @if (hasActiveFilters()) {
                <div class="mt-6">
                  <app-button variant="outline" size="sm" (click)="clearFilters()">
                    Clear filters
                  </app-button>
                </div>
              }
            </div>
          } @else {
            <div class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
              @for (product of paginated(); track product.id) {
                <app-product-card [product]="product" />
              }
            </div>

            @if (totalPages() > 1) {
              <div class="mt-12 flex flex-col items-center gap-3">
                <nav class="flex items-center gap-1.5" aria-label="Pagination">
                  <button
                    type="button"
                    [disabled]="clampedPage() === 1"
                    (click)="goToPage(clampedPage() - 1)"
                    class="flex size-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-300 dark:hover:text-neutral-100"
                    aria-label="Previous page"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" class="size-4" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.7 5.3a1 1 0 0 1 0 1.4L9.4 10l3.3 3.3a1 1 0 1 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 0 1 1.4 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  @for (p of visiblePages(); track p) {
                    @if (p === '…') {
                      <span class="px-1 text-sm text-neutral-400">…</span>
                    } @else {
                      <button
                        type="button"
                        (click)="goToPage(p)"
                        [attr.aria-current]="p === clampedPage() ? 'page' : null"
                        class="flex size-10 items-center justify-center rounded-full text-sm font-medium transition-colors {{ p === clampedPage() ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950' : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800' }}"
                      >
                        {{ p }}
                      </button>
                    }
                  }
                  <button
                    type="button"
                    [disabled]="clampedPage() === totalPages()"
                    (click)="goToPage(clampedPage() + 1)"
                    class="flex size-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-300 dark:hover:text-neutral-100"
                    aria-label="Next page"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" class="size-4" aria-hidden="true">
                      <path fill-rule="evenodd" d="M7.3 14.7a1 1 0 0 1 0-1.4l3.3-3.3-3.3-3.3a1 1 0 1 1 1.4-1.4l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </nav>
                <p class="text-xs text-neutral-400">
                  Showing {{ (clampedPage() - 1) * pageSize + 1 }}–{{ Math.min(clampedPage() * pageSize, totalItems()) }} of {{ totalItems() }} products
                </p>
              </div>
            }
          }
        </section>
      </div>
    </main>
  `,
})
export class ProductsListingComponent implements OnInit {
  readonly pageSize = PAGE_SIZE;
  readonly Math = Math;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductService);
  private readonly platform = inject(PlatformService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly allProducts = signal<ProductResponse[]>([]);
  readonly categories = signal<CategoryResponse[]>([]);
  private readonly catalogProducts = signal<ProductResponse[]>([]);

  readonly categoryId = signal<number | null>(null);
  readonly search = signal('');
  readonly sort = signal<SortOption>('featured');
  readonly page = signal(1);

  readonly sorted = computed(() => sortProducts(this.allProducts(), this.sort()));
  readonly totalItems = computed(() => this.sorted().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / PAGE_SIZE)));
  readonly clampedPage = computed(() => Math.min(this.page(), this.totalPages()));
  readonly paginated = computed(() => {
    const start = (this.clampedPage() - 1) * PAGE_SIZE;
    return this.sorted().slice(start, start + PAGE_SIZE);
  });
  readonly activeCategory = computed(
    () => this.categories().find((c) => c.id === this.categoryId()) ?? null,
  );
  readonly hasActiveFilters = computed(() => this.categoryId() !== null || this.search() !== '');
  readonly catalogCount = computed(() => this.catalogProducts().length);

  readonly visiblePages = computed<(number | '…')[]>(() => {
    const total = this.totalPages();
    const current = this.clampedPage();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const wanted = new Set([1, total, current - 1, current, current + 1]);
    const pages = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    const out: (number | '…')[] = [];
    let prev = 0;
    for (const p of pages) {
      if (prev !== 0 && p - prev > 1) {
        out.push('…');
      }
      out.push(p);
      prev = p;
    }
    return out;
  });

  private lastFetchKey = '';

  ngOnInit(): void {
    if (!this.platform.isBrowser) {
      return;
    }
    this.loadFilterCategories();
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const rawCategory = params.get('categoryId');
        this.categoryId.set(rawCategory ? Number(rawCategory) : null);
        this.search.set(params.get('search') ?? '');
        const rawSort = params.get('sort');
        this.sort.set(isSortOption(rawSort) ? rawSort : 'featured');
        const rawPage = params.get('page');
        this.page.set(rawPage ? Number(rawPage) : 1);
        this.fetchProducts();
      });
  }

  categoryCount(categoryId: number): number {
    return this.catalogProducts().filter((p) => p.category.id === categoryId).length;
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.navigate({ sort: value === 'featured' ? null : value, page: null });
  }

  clearCategory(): void {
    this.navigate({ categoryId: null, page: null });
  }

  clearSearch(): void {
    this.navigate({ search: null, page: null });
  }

  clearFilters(): void {
    this.navigate({ categoryId: null, search: null, page: null });
  }

  goToPage(page: number): void {
    this.navigate({ page: page > 1 ? String(page) : null });
  }

  /** Merge the given params into the URL; null values remove the key. */
  private navigate(query: Record<string, string | null>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: query,
      queryParamsHandling: 'merge',
    });
  }

  private loadFilterCategories(): void {
    this.productsService
      .getCatalog()
      .pipe(take(1))
      .subscribe({
        next: (products) => {
          const derived = deriveCategories(products).sort((a, b) => a.name.localeCompare(b.name));
          this.categories.set(derived);
          this.catalogProducts.set(products);
        },
      });
  }

  /** Refetch only when the backend-affecting filters (category/search) change. */
  private fetchProducts(): void {
    const key = `${this.categoryId() ?? ''}|${this.search()}`;
    if (key === this.lastFetchKey) {
      return;
    }
    this.lastFetchKey = key;
    this.loading.set(true);
    this.productsService
      .getAll({
        categoryId: this.categoryId() ?? undefined,
        search: this.search() || undefined,
      })
      .pipe(take(1))
      .subscribe({
        next: (products) => {
          this.allProducts.set(products);
          this.loading.set(false);
        },
        error: () => {
          this.allProducts.set([]);
          this.loading.set(false);
        },
      });
  }
}
