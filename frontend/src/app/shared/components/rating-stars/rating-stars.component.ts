import { Component, input } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center gap-0.5"
      role="img"
      [attr.aria-label]="'Rated ' + value() + ' out of 5'"
    >
      @for (star of stars; track star) {
        <svg
          viewBox="0 0 20 20"
          class="size-4"
          [attr.fill]="filled(star) ? 'currentColor' : 'none'"
          [class]="filled(star) ? 'text-accent-500' : 'text-neutral-300 dark:text-neutral-600'"
          aria-hidden="true"
        >
          <path
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
            d="M10 1.5l2.47 5.01 5.53.8-4 3.9.95 5.52L10 14.11l-4.95 2.6.95-5.52-4-3.9 5.53-.8L10 1.5z"
          />
        </svg>
      }
    </span>
  `,
})
export class RatingStarsComponent {
  readonly value = input<number>(0);

  protected readonly stars = [1, 2, 3, 4, 5];

  filled(star: number): boolean {
    return star <= Math.round(this.value());
  }
}
