import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LinkButtonComponent } from '../button/link-button.component';

/**
 * Temporary placeholder for feature pages that arrive in later phases
 * (products, cart, auth, checkout). Replaced as each page is built.
 */
@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [RouterLink, LinkButtonComponent],
  template: `
    <section class="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span class="mb-4 rounded-full bg-primary-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-800 dark:bg-primary-900/60 dark:text-primary-200">
        Coming soon
      </span>
      <h1 class="font-display text-4xl font-semibold text-neutral-900 dark:text-neutral-50">
        {{ title() }}
      </h1>
      <p class="mt-4 text-neutral-500 dark:text-neutral-400">
        {{ description() }}
      </p>
      <div class="mt-8">
        <app-link-button variant="outline" routerLink="/">Back to home</app-link-button>
      </div>
    </section>
  `,
})
export class ComingSoonComponent {
  readonly title = input('This page is on the way');
  readonly description = input(
    'We are building this experience now. Check back soon.',
  );
}
