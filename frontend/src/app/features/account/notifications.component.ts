import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { NotificationResponse, NotificationType } from '../../core/models/notification';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { formatDate } from '../../core/utils/format';
import { LinkButtonComponent } from '../../shared/components/button/link-button.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

type Tone = 'success' | 'accent' | 'danger';

const NOTIFICATION_TONE: Record<NotificationType, Tone> = {
  PAYMENT_SUCCESS: 'success',
  ORDER_CONFIRMED: 'success',
  ORDER_DELIVERED: 'success',
  ORDER_SHIPPED: 'accent',
  PAYMENT_REFUNDED: 'accent',
  ORDER_CANCELLED: 'danger',
};

const BASE_ICON_CLASS = 'flex size-10 shrink-0 items-center justify-center rounded-full';

const TONE_ICON_CLASS: Record<Tone, string> = {
  success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300',
  accent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  danger: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300',
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [RouterLink, LinkButtonComponent, SkeletonComponent],
  template: `
    <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav class="mb-8 text-sm text-neutral-500 dark:text-neutral-400" aria-label="Breadcrumb">
        <a routerLink="/" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Home</a>
        <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
        <span class="text-neutral-900 dark:text-neutral-50">Notifications</span>
      </nav>

      <h1 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
        Notifications
      </h1>

      @if (loading()) {
        <div class="mt-8 flex flex-col gap-4">
          <app-skeleton shape="h-20 w-full rounded-2xl" />
          <app-skeleton shape="h-20 w-full rounded-2xl" />
          <app-skeleton shape="h-20 w-full rounded-2xl" />
        </div>
      } @else if (notifications().length === 0) {
        <div class="mt-8 rounded-2xl border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
          <p class="font-display text-lg font-medium text-neutral-900 dark:text-neutral-100">No notifications yet</p>
          <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Order and payment updates will show up here.
          </p>
          <div class="mt-6">
            <app-link-button routerLink="/products" variant="outline">Continue shopping</app-link-button>
          </div>
        </div>
      } @else {
        <ul class="mt-8 space-y-3">
          @for (notification of notifications(); track notification.id) {
            <li class="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <span [class]="iconClass(notification.type)">
                @if (isOrder(notification.type)) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-5" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m5 7 5-3 5 3-5 3-5-3zm0 0v6l5 3 5-3V7" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 7v5" />
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-5" aria-hidden="true">
                    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
                    <path stroke-linecap="round" d="M2.5 9.5h19M6 14.5h4" />
                  </svg>
                }
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm text-neutral-900 dark:text-neutral-100">{{ notification.message }}</p>
                <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{{ formatDate(notification.createdAt) }}</p>
              </div>
              @if (notification.orderId != null) {
                <a
                  [routerLink]="['/orders', notification.orderId]"
                  class="shrink-0 text-sm font-medium text-primary-700 transition-colors hover:text-primary-900 dark:text-primary-300 dark:hover:text-primary-200"
                >
                  View order
                </a>
              }
            </li>
          }
        </ul>
      }
    </main>
  `,
})
export class NotificationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly notifications = signal<NotificationResponse[]>([]);

  formatDate = formatDate;

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }
    this.notificationService
      .getByUser(userId)
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe({
        next: (list) => {
          this.notifications.set(list);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  iconClass(type: NotificationType): string {
    return `${BASE_ICON_CLASS} ${TONE_ICON_CLASS[NOTIFICATION_TONE[type]]}`;
  }

  isOrder(type: NotificationType): boolean {
    return type.startsWith('ORDER_');
  }
}
