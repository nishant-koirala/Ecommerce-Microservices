import { Component, inject } from '@angular/core';

import { ToastService, ToastType } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:right-4 sm:bottom-4 sm:left-auto sm:items-end"
      role="status"
      aria-live="polite"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-card backdrop-blur"
          [class]="toastStyles[toast.type]"
          role="alert"
        >
          <span class="flex-1">{{ toast.message }}</span>
          <button
            type="button"
            class="text-current/60 transition-colors hover:text-current"
            (click)="dismiss(toast.id)"
            aria-label="Dismiss notification"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" class="size-4" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  readonly toastService = inject(ToastService);

  protected readonly toastStyles: Record<ToastType, string> = {
    success:
      'border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/95 dark:text-emerald-200',
    error:
      'border-red-200 bg-red-50/95 text-red-900 dark:border-red-800 dark:bg-red-950/95 dark:text-red-200',
    info: 'border-neutral-200 bg-white/95 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900/95 dark:text-neutral-100',
  };

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
