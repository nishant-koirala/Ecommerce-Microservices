import { Directive, ElementRef, HostBinding, inject } from '@angular/core';

import { useInView } from '../../core/utils/in-view';

/**
 * Scroll-triggered reveal: the host fades/slides in the first time it enters
 * the viewport. Add `appReveal` to a section/container to opt in.
 *
 * The CSS (`styles.css`) keeps the element invisible until the `reveal-visible`
 * class is added, and disables the effect entirely under
 * `prefers-reduced-motion: reduce`.
 *
 * Uses host bindings (not imperative classList) so server-rendered and
 * client-rendered markup stay identical for hydration: `useInView` reports the
 * same "not yet revealed" state during SSR.
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly inView = useInView(() => this.host.nativeElement);

  @HostBinding('class.reveal') readonly revealBase = true;

  @HostBinding('class.reveal-visible')
  get revealed(): boolean {
    return this.inView();
  }
}
