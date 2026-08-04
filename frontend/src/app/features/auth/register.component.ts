import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { LoginRequest, RegisterRequest } from '../../core/models/auth';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.parent?.get('password')?.value;
  return password && control.value === password ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  template: `
    <main class="bg-neutral-50 dark:bg-neutral-950">
      <div class="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl lg:grid-cols-2">
        <!-- Brand panel -->
        <div class="hidden flex-col justify-between p-12 lg:flex lg:bg-neutral-900">
          <a routerLink="/" class="flex items-center gap-2" aria-label="Atelier home">
            <span class="flex size-9 items-center justify-center rounded-xl bg-primary-600 font-display text-lg font-bold text-white dark:bg-primary-500">
              A
            </span>
            <span class="font-display text-xl font-semibold tracking-tight text-white">Atelier</span>
          </a>
          <div>
            <h2 class="font-display text-3xl font-semibold leading-tight text-white">
              Join Atelier and start collecting.
            </h2>
            <p class="mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
              Create your account to keep a cart across devices, track orders, and check out in a few taps.
            </p>
          </div>
          <p class="text-xs text-neutral-500">Curated for the modern home.</p>
        </div>

        <!-- Form panel -->
        <div class="flex items-center justify-center px-4 py-12 sm:px-6">
          <div class="w-full max-w-md">
            <header class="mb-8">
              <p class="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">Get started</p>
              <h1 class="mt-1 font-display text-3xl font-semibold text-neutral-900 dark:text-neutral-50">
                Create your account
              </h1>
              <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                It takes less than a minute.
              </p>
            </header>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-4">
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
              <label>
                <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</span>
                <input
                  formControlName="email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                  class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50"
                />
              </label>
              <label>
                <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</span>
                <input
                  formControlName="password"
                  type="password"
                  autocomplete="new-password"
                  placeholder="At least 8 characters"
                  class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50"
                />
              </label>
              <label>
                <span class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Confirm password</span>
                <input
                  formControlName="confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  placeholder="Re-enter your password"
                  class="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50"
                />
              </label>

              <div class="pt-1">
                <app-button
                  type="submit"
                  size="lg"
                  [fullWidth]="true"
                  [busy]="submitting()"
                  [disabled]="submitting() || form.invalid"
                >
                  Create account
                </app-button>
              </div>
            </form>

            <p class="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
              Already have an account?
              <a routerLink="/auth/login" class="font-medium text-primary-700 underline-offset-2 hover:underline dark:text-primary-300">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  `,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);

  readonly form = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required, passwordMatch]),
  });

  onSubmit(): void {
    if (this.submitting() || this.form.invalid) {
      return;
    }
    this.submitting.set(true);
    const { firstName, lastName, email, password } = this.form.getRawValue();
    this.auth
      .register({ firstName, lastName, email, password } as RegisterRequest)
      .pipe(switchMap(() => this.auth.login({ email, password } as LoginRequest)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.redirectPath()),
        error: () => this.submitting.set(false),
      });
  }

  private redirectPath(): string {
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    return redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';
  }
}
