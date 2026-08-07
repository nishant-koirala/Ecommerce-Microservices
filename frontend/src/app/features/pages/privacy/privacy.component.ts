import { Component } from '@angular/core';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Legal"
      title="Privacy policy"
      subtitle="What we collect, why, and how little of it there is."
    />

    <div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="space-y-12 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        <section>
          <h2 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">What we collect</h2>
          <p class="mt-4">
            We collect only what's needed to run the store: your name, email address, shipping
            address, and order history. We never buy or sell personal data.
          </p>
        </section>

        <section>
          <h2 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Why we use it</h2>
          <p class="mt-4">
            Your details fulfil your orders, keep you updated on delivery, and — only if you opt in —
            send occasional product news. That's the whole list.
          </p>
        </section>

        <section>
          <h2 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">What we don't do</h2>
          <p class="mt-4">
            We don't sell or share your personal information with third parties for their own
            marketing. We don't track you across the web, and this store uses no advertising pixels.
          </p>
        </section>

        <section>
          <h2 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Your rights</h2>
          <p class="mt-4">
            You can request a copy of your data, ask us to correct it, or ask us to delete it at any
            time by emailing us. We'll respond within one business day.
          </p>
        </section>

        <section>
          <h2 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Contact</h2>
          <p class="mt-4">
            Privacy questions? Email <a href="mailto:hello@atelier.dev" class="font-medium text-primary-700 hover:underline dark:text-primary-300">hello@atelier.dev</a>.
          </p>
        </section>
      </div>
    </div>
  `,
})
export class PrivacyComponent {}
