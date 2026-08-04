import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `<div [class]="classes()" aria-hidden="true"></div>`,
})
export class SkeletonComponent {
  /** Tailwind shape classes, e.g. 'h-4 w-full' or 'aspect-square w-full rounded-2xl'. */
  readonly shape = input('h-4 w-full');

  protected readonly classes = computed(
    () =>
      `animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800 ${this.shape()}`,
  );
}
