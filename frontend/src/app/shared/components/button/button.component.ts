import { Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white shadow-soft hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400',
  accent:
    'bg-accent-500 text-neutral-950 shadow-soft hover:bg-accent-400',
  secondary:
    'bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200',
  outline:
    'border border-neutral-300 text-neutral-900 hover:border-neutral-900 hover:bg-neutral-50 ' +
    'dark:border-neutral-600 dark:text-neutral-100 dark:hover:border-neutral-300 dark:hover:bg-neutral-900',
  ghost:
    'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
};

/** Shared pill styling for both <app-button> and <app-link-button>. */
export function buttonClasses(variant: ButtonVariant, size: ButtonSize): string {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ' +
    'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';
  return [base, sizeClasses[size], variantClasses[variant]].join(' ');
}

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [attr.aria-busy]="busy() ? 'true' : null"
      [class]="classes()"
    >
      @if (busy()) {
        <span class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false);
  readonly busy = input(false);
  readonly fullWidth = input(false);
  readonly type = input<'button' | 'submit'>('button');

  protected readonly classes = computed(() => {
    const base = buttonClasses(this.variant(), this.size());
    return this.fullWidth() ? `${base} w-full` : base;
  });
}
