import { Component, input } from '@angular/core';

/**
 * Shared eyebrow + title + subtitle header for the static info pages
 * (about, contact, faq, shipping-returns, terms, privacy).
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p class="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          {{ eyebrow() }}
        </p>
        <h1
          class="mt-2 font-display text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl"
        >
          {{ title() }}
        </h1>
        @if (subtitle(); as s) {
          <p class="mt-3 max-w-2xl text-lg text-neutral-500 dark:text-neutral-400">{{ s }}</p>
        }
      </div>
    </header>
  `,
})
export class PageHeaderComponent {
  readonly eyebrow = input('');
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
