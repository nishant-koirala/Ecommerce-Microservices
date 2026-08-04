import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ToastService } from '../../../../core/services/toast.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  template: `
    <section id="newsletter" class="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
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
            class="w-full flex-1 rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder:text-neutral-500"
          />
          <app-button type="submit" [disabled]="form.invalid">Subscribe</app-button>
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
  private readonly toast = inject(ToastService);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success('Thanks for subscribing — welcome to the circle!');
    this.form.reset();
  }
}
