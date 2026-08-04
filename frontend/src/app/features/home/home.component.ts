import { Component, OnInit, inject, signal } from '@angular/core';
import { take } from 'rxjs';

import { CategoryResponse, ProductResponse } from '../../core/models/product';
import { PlatformService } from '../../core/services/platform.service';
import { ProductService } from '../../core/services/product.service';
import { deriveCategories } from '../../core/utils/products';
import { CategoriesSectionComponent } from './sections/categories/categories-section.component';
import { HeroSectionComponent } from './sections/hero/hero-section.component';
import { NewsletterSectionComponent } from './sections/newsletter/newsletter-section.component';
import { PromoBannerSectionComponent } from './sections/promo-banner/promo-banner-section.component';
import { TestimonialsSectionComponent } from './sections/testimonials/testimonials-section.component';
import { TrendingProductsSectionComponent } from './sections/trending-products/trending-products-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroSectionComponent,
    CategoriesSectionComponent,
    TrendingProductsSectionComponent,
    PromoBannerSectionComponent,
    TestimonialsSectionComponent,
    NewsletterSectionComponent,
  ],
  template: `
    <main>
      <app-hero />
      <app-categories [categories]="categories()" [loading]="loading()" />
      <app-trending-products [products]="trending()" [loading]="loading()" />
      <app-promo-banner />
      <app-testimonials />
      <app-newsletter />
    </main>
  `,
})
export class HomeComponent implements OnInit {
  private readonly productsService = inject(ProductService);
  private readonly platform = inject(PlatformService);

  readonly loading = signal(true);
  readonly categories = signal<CategoryResponse[]>([]);
  readonly trending = signal<ProductResponse[]>([]);

  ngOnInit(): void {
    if (!this.platform.isBrowser) {
      return;
    }
    this.productsService
      .getAll()
      .pipe(take(1))
      .subscribe({
        next: (products) => {
          this.trending.set(products.slice(0, 8));
          this.categories.set(deriveCategories(products));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
