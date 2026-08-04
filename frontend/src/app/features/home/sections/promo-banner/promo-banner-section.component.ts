import { Component } from '@angular/core';

import { LinkButtonComponent } from '../../../../shared/components/button/link-button.component';

@Component({
  selector: 'app-promo-banner',
  standalone: true,
  imports: [LinkButtonComponent],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div
        class="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-800 via-primary-900 to-neutral-950 px-6 py-14 text-center sm:px-12 lg:py-20"
      >
        <div
          class="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-accent-500/20 blur-3xl"
          aria-hidden="true"
        ></div>
        <div
          class="pointer-events-none absolute -bottom-20 -right-10 size-72 rounded-full bg-primary-500/30 blur-3xl"
          aria-hidden="true"
        ></div>

        <p class="relative text-xs font-semibold uppercase tracking-widest text-accent-300">
          Limited time
        </p>
        <h2 class="relative mx-auto mt-3 max-w-2xl font-display text-3xl font-medium leading-tight text-white sm:text-5xl">
          Save 20% on your first order
        </h2>
        <p class="relative mx-auto mt-4 max-w-lg text-neutral-300">
          Join the Atelier circle and get a welcome discount plus early access to new drops.
        </p>
        <div class="relative mt-8">
          <app-link-button size="lg" variant="accent" href="#newsletter">Claim the offer</app-link-button>
        </div>
      </div>
    </section>
  `,
})
export class PromoBannerSectionComponent {}
