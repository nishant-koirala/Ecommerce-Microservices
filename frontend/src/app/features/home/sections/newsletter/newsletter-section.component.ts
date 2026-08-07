import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, RevealDirective],
  template: `
    <section id="newsletter" appReveal class="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
      <div
        class="mx-auto max-w-2xl rounded-[2rem] border border-neutral-200 bg-white px-6 py-12 text-center shadow-card dark:border-neutral-800 dark:bg-neutral-900 sm:px-12"
      >
        <h2 class="font-display text-3xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-4xl">
          Join the Atelier circle
        </h2>
        <p class="mt-3 text-neutral-500 dark:text-neutral-400">
          Get 20% off your first order, plus early access to new arrivals.
        </p>

        <form
          [formGroup]="form"
          (ngSubmit)="submit()"
          class="mt-8 flex flex-col gap-3 sm:flex-row"
          novalidate
        >
          <label class="sr-only" for="newsletter-email">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            formControlName="email"
            placeholder="you@example.com"
            class="w-full flex-1 rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm text-neutral-900 transition-all duration-200 placeholder:text-neutral-400 focus:border-primary-500 focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder:text-neutral-500"
          />
          <app-button type="submit" [disabled]="form.invalid || subscribed()">
            @if (subscribed()) {
              <span class="animate-pop flex items-center gap-1.5">
                <svg viewBox="0 0 20 20" fill="currentColor" class="size-4" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l4.1 4.1 6.8-6.8a1 1 0 0 1 1.1 0z" clip-rule="evenodd"/>
                </svg>
                Subscribed
              </span>
            } @else {
              Subscribe
            }
          </app-button>
        </form>
        @if (form.get('email')?.touched && form.get('email')?.invalid) {
          <p class="mt-3 text-sm text-red-600 dark:text-red-400">
            Please enter a valid email address.
          </p>
        }
      </div>
    </section>
  `,
})
export class NewsletterSectionComponent {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly subscribed = signal(false);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.form.reset();
    this.subscribed.set(true);
    // Briefly show the success state, then restore the CTA.
    setTimeout(() => this.subscribed.set(false), 1800);
  }
}
