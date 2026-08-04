import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonSize, ButtonVariant, buttonClasses } from './button.component';

/**
 * Anchor variant of <app-button> for real navigation. Kept as a separate
 * component because content projection into two conditionally-switched
 * elements isn't reliable in Angular's @if control flow.
 */
@Component({
  selector: 'app-link-button',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a
      [routerLink]="routerLink()"
      [href]="href() ?? null"
      [attr.aria-busy]="busy() ? 'true' : null"
      [class]="classes()"
    >
      <ng-content></ng-content>
    </a>
  `,
})
export class LinkButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly fullWidth = input(false);
  readonly busy = input(false);
  /** In-app route, e.g. ['/products']. */
  readonly routerLink = input<string | unknown[] | null>(null);
  /** External/plain URL target when no routerLink is set. */
  readonly href = input<string | null>(null);

  protected readonly classes = computed(() => {
    const base = buttonClasses(this.variant(), this.size());
    return this.fullWidth() ? `${base} w-full` : base;
  });
}
