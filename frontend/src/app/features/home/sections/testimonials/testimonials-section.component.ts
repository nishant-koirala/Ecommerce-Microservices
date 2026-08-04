import { Component } from '@angular/core';

import { RatingStarsComponent } from '../../../../shared/components/rating-stars/rating-stars.component';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [RatingStarsComponent],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="mb-10 text-center">
        <p class="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          From our customers
        </p>
        <h2 class="mt-2 font-display text-3xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-4xl">
          Loved by thousands
        </h2>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        @for (item of testimonials; track item.name) {
          <figure
            class="flex flex-col rounded-2xl border border-neutral-200 bg-white p-7 shadow-soft dark:border-neutral-800 dark:bg-neutral-900"
          >
            <app-rating-stars [value]="item.rating" />
            <blockquote class="mt-4 flex-1 font-display text-lg leading-relaxed text-neutral-800 dark:text-neutral-100">
              &ldquo;{{ item.quote }}&rdquo;
            </blockquote>
            <figcaption class="mt-6 flex items-center gap-3">
              <span
                class="flex size-10 items-center justify-center rounded-full bg-primary-100 font-display text-base font-semibold text-primary-800 dark:bg-primary-900/60 dark:text-primary-200"
                aria-hidden="true"
              >
                {{ item.name.charAt(0) }}
              </span>
              <div>
                <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{{ item.name }}</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ item.role }}</p>
              </div>
            </figcaption>
          </figure>
        }
      </div>
    </section>
  `,
})
export class TestimonialsSectionComponent {
  protected readonly testimonials: Testimonial[] = [
    {
      quote: 'The quality is unreal. My favorite pieces now live in my closet.',
      name: 'Maya Chen',
      role: 'Verified buyer',
      rating: 5,
    },
    {
      quote: 'Shipping was fast and the packaging felt like a gift to myself.',
      name: 'Daniel Osei',
      role: 'Verified buyer',
      rating: 5,
    },
    {
      quote: 'Finally a store where everything on the page matches the real thing.',
      name: 'Priya Sharma',
      role: 'Verified buyer',
      rating: 4.5,
    },
  ];
}
