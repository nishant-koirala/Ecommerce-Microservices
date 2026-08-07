import { Component } from '@angular/core';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Legal"
      title="Terms of service"
      subtitle="The straightforward version of how using Atelier works."
    />

    <div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="space-y-12 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        <section>
          <h2 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">1. Using Atelier</h2>
          <p class="mt-4">
            By placing an order you agree to provide accurate information and to be of legal age to
            make a purchase. Products are offered for personal, non-commercial use.
          </p>
        </section>

        <section>
          <h2 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">2. Orders &amp; pricing</h2>
          <p class="mt-4">
            Prices are listed in the currency of the storefront and include applicable taxes unless
            stated otherwise. We may decline or cancel an order if an item is mispriced, out of
            stock, or appears fraudulent — and we'll always notify you before doing so.
          </p>
        </section>

        <section>
          <h2 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">3. Returns &amp; warranty</h2>
          <p class="mt-4">
            Returns and our 2-year craft warranty are governed by our shipping &amp; returns
            policy, which forms part of these terms.
          </p>
        </section>

        <section>
          <h2 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">4. Limitation of liability</h2>
          <p class="mt-4">
            To the maximum extent permitted by law, our liability for any claim is limited to the
            amount you paid for the products giving rise to the claim. Nothing in these terms
            limits rights that cannot be limited by law.
          </p>
        </section>

        <section>
          <h2 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">5. Changes</h2>
          <p class="mt-4">
            We may update these terms from time to time. The current version always lives on this
            page, and continued use of the store after a change means you accept the updated terms.
          </p>
        </section>
      </div>
    </div>
  `,
})
export class TermsComponent {}
