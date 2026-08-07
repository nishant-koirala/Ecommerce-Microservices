import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Our story"
      title="Made to last, chosen with care"
      subtitle="Atelier began with a simple question: why should everyday goods feel disposable?"
    />

    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl space-y-10">
        <section class="prose-invert space-y-4 text-neutral-600 dark:text-neutral-300">
          <p class="text-lg leading-relaxed">
            We started Atelier as a small studio workshop with a stubborn belief: the objects you
            reach for every day should be a pleasure to hold, not a chore to replace. Every piece
            in the catalogue is chosen for its craft, its honesty of materials, and its willingness
            to age well.
          </p>
          <p class="leading-relaxed">
            We work directly with independent makers and small family workshops, which means we can
            keep quality high, prices honest, and the supply chain short enough to see with our own
            eyes. What you get is not a trend with a shipping label — it&rsquo;s something designed
            to be used, repaired, and kept.
          </p>
        </section>

        <dl class="grid gap-6 sm:grid-cols-3">
          <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <dt class="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">Craft</dt>
            <dd class="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Every piece carries a 2-year craft warranty. If it breaks, we repair or replace it.
            </dd>
          </div>
          <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <dt class="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">Honesty</dt>
            <dd class="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              No greenwashing, no mystery materials. If we don&rsquo;t know where it came from, we
              don&rsquo;t sell it.
            </dd>
          </div>
          <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <dt class="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">Longevity</dt>
            <dd class="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              A smaller catalogue, restocked slowly, built to outlast the season it arrives in.
            </dd>
          </div>
        </dl>

        <section class="rounded-[2rem] bg-primary-900 px-6 py-10 text-center dark:bg-primary-950 sm:px-12">
          <h2 class="font-display text-2xl font-medium text-white sm:text-3xl">From our studio to your door</h2>
          <p class="mx-auto mt-3 max-w-xl text-neutral-300">
            Explore the collection, or get in touch — we read every message ourselves.
          </p>
          <a routerLink="/products" class="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-accent-500 px-7 py-3.5 text-base font-medium text-neutral-950 shadow-soft transition-all duration-200 hover:bg-accent-400 active:scale-[0.98]">
            Shop the collection
          </a>
        </section>
      </div>
    </div>
  `,
})
export class AboutComponent {}
