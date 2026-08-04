import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { UpdateUserRequest } from '../../core/models/auth';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LinkButtonComponent } from '../../shared/components/button/link-button.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, LinkButtonComponent, BadgeComponent],
  template: `
    <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav class="mb-8 text-sm text-neutral-500 dark:text-neutral-400" aria-label="Breadcrumb">
        <a routerLink="/" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Home</a>
        <span class="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
        <span class="text-neutral-900 dark:text-neutral-50">My account</span>
      </nav>

      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <span class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary-600 font-display text-2xl font-bold text-white dark:bg-primary-500">
            {{ initials() }}
          </span>
          <div>
            <h1 class="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              {{ auth.displayName() }}
            </h1>
            <p class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{{ auth.currentUser()?.email }}</p>
          </div>
        </div>
        <app-badge [tone]="auth.currentUser()?.role === 'ADMIN' ? 'accent' : 'primary'">
          {{ auth.currentUser()?.role }}
        </app-badge>
      </header>

      <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section aria-label="Edit profile" class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 class="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">Edit profile</h2>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Update your name — email and password can't be changed here yet.
          </p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="mt-5 space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <label>
                <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">First name</span>
                <input
                  formControlName="firstName"
                  type="text"
                  autocomplete="given-name"
                  placeholder="Alex"
                  class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50"
                />
              </label>
              <label>
                <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Last name</span>
                <input
                  formControlName="lastName"
                  type="text"
                  autocomplete="family-name"
                  placeholder="Rivera"
                  class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50"
                />
              </label>
            </div>
            <div class="pt-1">
              <app-button
                type="submit"
                [busy]="submitting()"
                [disabled]="submitting() || form.invalid"
              >
                Save changes
              </app-button>
            </div>
          </form>
        </section>

        <aside class="flex flex-col gap-6 self-start">
          <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 class="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Orders</h2>
            <p class="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              View your order history, status, and totals.
            </p>
            <div class="mt-5">
              <app-link-button routerLink="/account/orders" [fullWidth]="true">My orders</app-link-button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  `,
})
export class AccountComponent {
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly submitting = signal(false);

  readonly form = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
  });

  constructor() {
    const user = this.auth.currentUser();
    if (user) {
      this.form.patchValue({ firstName: user.firstName, lastName: user.lastName });
    }
  }

  readonly initials = computed(() => {
    const user = this.auth.currentUser();
    if (!user) {
      return '';
    }
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  });

  onSubmit(): void {
    if (this.submitting() || this.form.invalid) {
      return;
    }
    this.submitting.set(true);
    const { firstName, lastName } = this.form.getRawValue();
    this.auth.updateProfile({ firstName, lastName } as UpdateUserRequest).subscribe({
      next: () => this.submitting.set(false),
      error: () => {
        this.toast.error('Could not update your profile. Please try again.');
        this.submitting.set(false);
      },
    });
  }
}
