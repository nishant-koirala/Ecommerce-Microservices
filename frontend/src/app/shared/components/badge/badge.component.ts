import { Component, computed, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'success' | 'danger';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span [class]="classes()"><ng-content></ng-content></span>
  `,
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('neutral');

  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider';
    return [base, this.tones[this.tone()]].join(' ');
  });

  private readonly tones: Record<BadgeTone, string> = {
    neutral:
      'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    primary:
      'bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:text-primary-200',
    accent:
      'bg-accent-200/70 text-accent-900 dark:bg-accent-900/50 dark:text-accent-200',
    success:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    danger:
      'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
}
