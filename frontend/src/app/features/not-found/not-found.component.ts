import { Component } from '@angular/core';

import { LinkButtonComponent } from '../../shared/components/button/link-button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [LinkButtonComponent],
  template: `
    <main class="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <p class="font-display text-6xl font-semibold text-primary-700 dark:text-primary-400">404</p>
      <h1 class="mt-4 font-display text-3xl font-medium text-neutral-900 dark:text-neutral-50 sm:text-4xl">
        That page has wandered off
      </h1>
      <p class="mt-4 max-w-md text-neutral-500 dark:text-neutral-400">
        The link you followed doesn&rsquo;t lead anywhere. It may have been moved, or the address
        was mistyped. Let&rsquo;s get you back on solid ground.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
        <app-link-button size="lg" routerLink="/">Back to home</app-link-button>
        <app-link-button size="lg" variant="outline" routerLink="/products">Browse products</app-link-button>
      </div>
    </main>
  `,
})
export class NotFoundComponent {}
