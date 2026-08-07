import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductResponse } from '../../../../core/models/product';
import { LinkButtonComponent } from '../../../../shared/components/button/link-button.component';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-trending-products',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, SkeletonComponent, LinkButtonComponent, RevealDirective],
  template: `
    <section id="trending" appReveal class="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
      <div class="mb-8 flex items-end justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
            Hand-picked
          </p>
          <h2 class="mt-2 font-display text-3xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-4xl">
            Trending now
          </h2>
        </div>
        <app-link-button variant="ghost" routerLink="/products" class="hidden shrink-0 sm:block">View all products &rarr;</app-link-button>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="flex flex-col gap-3">
              <app-skeleton shape="aspect-square w-full rounded-2xl" />
              <app-skeleton shape="h-4 w-2/3" />
              <app-skeleton shape="h-4 w-1/3" />
            </div>
          }
        </div>
      } @else if (products().length === 0) {
        <div class="rounded-2xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p class="text-neutral-500 dark:text-neutral-400">
            No products yet — the catalog is empty.
          </p>
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          @for (product of products(); track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      }
    </section>
  `,
})
export class TrendingProductsSectionComponent {
  readonly products = input<ProductResponse[]>([]);
  readonly loading = input(false);
}
