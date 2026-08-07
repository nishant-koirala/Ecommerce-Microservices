import { Component } from '@angular/core';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-shipping-returns',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Policies"
      title="Shipping & returns"
      subtitle="Free shipping over $75, 30-day returns, and our 2-year craft warranty."
    />

    <div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="space-y-12">
        <section>
          <h2 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Shipping</h2>
          <div class="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            <p>
              Orders are packed and dispatched from our studio within 1–2 business days. Standard
              delivery arrives in 3–5 business days; express delivery in 1–2.
            </p>
            <p>
              <strong class="text-neutral-900 dark:text-neutral-100">Free over $75.</strong> Orders
              over $75 always ship free, with no code required. Orders under $75 pay a flat
              standard rate shown at checkout.
            </p>
            <p>
              Every order ships with tracking, and you'll receive an email with your tracking link
              the moment your parcel leaves us.
            </p>
          </div>
        </section>

        <section>
          <h2 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Returns</h2>
          <div class="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            <p>
              You have <strong class="text-neutral-900 dark:text-neutral-100">30 days</strong> from
              delivery to return any item in its original condition for a full refund to the
              original payment method.
            </p>
            <p>
              We provide a prepaid return label for every order — start a return by emailing us and
              we'll send it over. Once your item arrives back at the studio, refunds are issued
              within 3–5 business days.
            </p>
            <p>
              A few items are final sale and are marked as such on their product page.
            </p>
          </div>
        </section>

        <section>
          <h2 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Craft warranty</h2>
          <div class="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            <p>
              Every piece carries a <strong class="text-neutral-900 dark:text-neutral-100">2-year
              craft warranty</strong>. If a product fails under normal use — seams, joins, finishes,
              hardware — we repair or replace it free of charge.
            </p>
            <p>
              The warranty doesn't cover normal wear from daily use, misuse, or accidental damage,
              but if something feels wrong, write to us before you assume it's on you.
            </p>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class ShippingReturnsComponent {}
