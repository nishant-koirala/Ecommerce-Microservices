import { Signal, effect, inject, signal } from '@angular/core';
import { PlatformService } from '../services/platform.service';

/**
 * Returns a signal that flips to `true` the first time `element` enters the
 * viewport and stays `true` afterwards (no re-trigger on scroll back out).
 *
 * Zoneless-friendly: the signal is written from the IntersectionObserver
 * callback directly — no zone needed.
 *
 * SSR-safe: on the server (or when IntersectionObserver is unavailable) it
 * resolves to `true` immediately so server-rendered markup never hides content.
 *
 * @param element   a getter for the element to observe; pass a template-ref
 *                  signal (`() => ref()`) so the observer is wired once the
 *                  view renders, or `() => hostElement` for a directive host.
 * @param rootMargin triggers slightly before the element is fully centered —
 *                  the default gives a comfortable reveal a touch early.
 */
export function useInView(
  element: () => HTMLElement | null,
  rootMargin = '0px 0px -64px 0px',
): Signal<boolean> {
  const platform = inject(PlatformService);
  const inView = signal(false);

  // On the server, report the same (hidden) initial state the client renders
  // first, so hydration sees identical markup. Below-fold content is off-screen
  // anyway, so an SSR'd "hidden" state is never visible to the user.
  if (!platform.isBrowser) {
    return inView.asReadonly();
  }

  // Ancient browsers without IntersectionObserver: never hide content.
  if (typeof IntersectionObserver === 'undefined') {
    inView.set(true);
    return inView.asReadonly();
  }

  effect((onCleanup) => {
    const el = element();
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          inView.set(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.1 },
    );
    observer.observe(el);
    onCleanup(() => observer.disconnect());
  });

  return inView.asReadonly();
}
