import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CategoryResponse } from '../../../../core/models/product';
import { ImageService } from '../../../../core/services/image.service';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink, RevealDirective, SkeletonComponent],
  template: `
    <section id="categories" appReveal class="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
      <div class="mb-8 flex items-end justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
            Collections
          </p>
          <h2 class="mt-2 font-display text-3xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-4xl">
            Browse by category
          </h2>
        </div>
        <a
          routerLink="/products"
          class="hidden shrink-0 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-700 sm:block dark:text-neutral-400 dark:hover:text-primary-300"
        >
          View all &rarr;
        </a>
      </div>

      <div class="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
        @if (loading()) {
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <app-skeleton shape="h-52 w-40 shrink-0 snap-start rounded-2xl sm:h-64 sm:w-48" />
          }
        } @else if (categories().length === 0) {
          <p class="w-full py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No collections yet.
          </p>
        } @else {
          @for (category of categories(); track category.id) {
            <a
              routerLink="/products"
              [queryParams]="{ categoryId: category.id }"
              class="group relative h-52 w-40 shrink-0 snap-start overflow-hidden rounded-2xl shadow-soft transition-transform duration-300 hover:-translate-y-1 sm:h-64 sm:w-48"
            >
              <img
                [src]="image(category)"
                [alt]="category.name"
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent"></div>
              <div class="absolute bottom-4 left-4 right-4">
                <p class="font-display text-lg font-semibold text-white">{{ category.name }}</p>
                <p class="mt-0.5 line-clamp-1 text-xs text-neutral-200/90">{{ category.description }}</p>
              </div>
            </a>
          }
        }
      </div>
    </section>
  `,
})
export class CategoriesSectionComponent {
  readonly categories = input<CategoryResponse[]>([]);
  readonly loading = input(false);

  private readonly imageService = inject(ImageService);

  image(category: CategoryResponse): string {
    return this.imageService.product(
      { id: category.id, sku: `category-${category.name}`, imageUrl: category.imageUrl },
      480,
    );
  }
}
