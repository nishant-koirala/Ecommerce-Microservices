import { Component } from '@angular/core';

import { LinkButtonComponent } from '../../../../shared/components/button/link-button.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [LinkButtonComponent],
  template: `
    <section class="relative overflow-hidden">
      <!-- Soft background wash -->
      <div
        class="pointer-events-none absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-900/30"
        aria-hidden="true"
      ></div>

      <div
        class="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20"
      >
        <div class="relative z-10">
          <p
            class="animate-rise mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-700 backdrop-blur dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-300"
            style="animation-delay: 0ms"
          >
            <span class="size-1.5 rounded-full bg-accent-500" aria-hidden="true"></span>
            New season · FW '26
          </p>

          <h1
            class="animate-rise font-display text-5xl font-medium leading-[1.04] tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-6xl lg:text-7xl"
            style="animation-delay: 90ms"
          >
            Essentials, <em class="italic text-primary-700 dark:text-primary-400">curated</em> with
            intention.
          </h1>

          <p class="animate-rise mt-6 max-w-md text-lg leading-relaxed text-neutral-600 dark:text-neutral-300" style="animation-delay: 180ms">
            Thoughtfully designed everyday goods, chosen for craft and built to last. From our
            studio to your door.
          </p>

          <div class="animate-rise mt-9 flex flex-wrap items-center gap-4" style="animation-delay: 270ms">
            <app-link-button size="lg" routerLink="/products">Shop the collection</app-link-button>
            <app-link-button size="lg" variant="outline" routerLink="/products">Explore categories</app-link-button>
          </div>

          <dl class="animate-rise mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-neutral-200 pt-8 dark:border-neutral-800" style="animation-delay: 360ms">
            <div>
              <dt class="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Shipping</dt>
              <dd class="mt-1 font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">Free &gt; $75</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Returns</dt>
              <dd class="mt-1 font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">30 days</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Craft</dt>
              <dd class="mt-1 font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">2-yr</dd>
            </div>
          </dl>
        </div>

        <!-- Asymmetric image collage -->
        <div class="relative h-[440px] lg:h-[540px]" aria-hidden="true">
          <img
            src="https://picsum.photos/seed/atelier-hero/720/920"
            alt=""
            class="animate-float absolute right-0 top-0 h-[88%] w-3/4 rounded-[2rem] object-cover shadow-card"
            fetchpriority="high"
          />
          <img
            src="https://picsum.photos/seed/atelier-hero-accent/420/420"
            alt=""
            class="animate-float-delayed absolute bottom-0 left-2 h-[46%] w-[45%] rounded-3xl border-4 border-neutral-50 object-cover shadow-card dark:border-neutral-950"
            loading="lazy"
          />
          <div
            class="absolute -bottom-2 right-4 rotate-1 rounded-2xl bg-accent-500 px-5 py-3 font-display text-base font-semibold text-neutral-950 shadow-card"
          >
            Free shipping over $75
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HeroSectionComponent {}
