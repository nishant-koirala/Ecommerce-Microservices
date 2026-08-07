import { Component } from '@angular/core';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

interface FaqEntry {
  q: string;
  a: string;
}

const FAQS: FaqEntry[] = [
  {
    q: 'How long does shipping take?',
    a: 'Orders ship within 1–2 business days. Standard delivery takes 3–5 business days, and express delivery arrives in 1–2. You\'ll get a tracking link the moment your order leaves our studio.',
  },
  {
    q: 'Do you really offer free shipping over $75?',
    a: 'Yes — every order over $75 ships free, no code needed. It\'s one of our three promises, along with 30-day returns and our 2-year craft warranty.',
  },
  {
    q: 'What is your return policy?',
    a: 'You have 30 days from delivery to return any item in its original condition for a full refund. We\'ll cover the return shipping label. See our shipping & returns page for the full details.',
  },
  {
    q: 'What does the 2-year craft warranty cover?',
    a: 'If a product fails under normal use within two years, we repair or replace it free of charge. Manufacturing defects, seams, joins, and finishes are all covered — this is the "built to last" promise.',
  },
  {
    q: 'Can I cancel or change my order?',
    a: 'As long as your order hasn\'t shipped yet, we can usually change the address, items, or cancel it entirely. Email us as soon as possible and we\'ll do our best.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently we ship within the region the store serves. International availability varies by product — add an item to your cart and the checkout will show live options for your address.',
  },
];

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Help center"
      title="Frequently asked questions"
      subtitle="Short answers to the questions we hear most. Still stuck? Head to our contact page."
    />

    <div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="space-y-3">
        @for (item of faqs; track item.q) {
          <details class="group rounded-2xl border border-neutral-200 bg-white transition-colors open:border-primary-300 dark:border-neutral-800 dark:bg-neutral-900 dark:open:border-primary-700">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-medium text-neutral-900 dark:text-neutral-50 [&::-webkit-details-marker]:hidden">
              {{ item.q }}
              <svg
                viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"
                class="size-4 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 7.5 10 12.5 15 7.5" />
              </svg>
            </summary>
            <p class="px-6 pb-5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{{ item.a }}</p>
          </details>
        }
      </div>
    </div>
  `,
})
export class FaqComponent {
  readonly faqs = FAQS;
}
