import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ToastService } from '../../../core/services/toast.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

const FIELD_CLASS =
  'w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Contact"
      title="We'd love to hear from you"
      subtitle="Order questions, product help, or just to say hello — we read every message."
    />

    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="grid gap-12 lg:grid-cols-5">
        <form
          [formGroup]="form"
          (ngSubmit)="submit()"
          class="space-y-5 lg:col-span-3"
          novalidate
        >
          <div>
            <label for="contact-name" class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</label>
            <input id="contact-name" type="text" formControlName="name" class="${FIELD_CLASS}" placeholder="Jane Doe" />
          </div>
          <div>
            <label for="contact-email" class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
            <input id="contact-email" type="email" formControlName="email" class="${FIELD_CLASS}" placeholder="you@example.com" />
          </div>
          <div>
            <label for="contact-message" class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Message</label>
            <textarea id="contact-message" rows="5" formControlName="message" class="${FIELD_CLASS}" placeholder="How can we help?"></textarea>
          </div>
          <app-button type="submit" [disabled]="form.invalid">Send message</app-button>
        </form>

        <aside class="space-y-6 lg:col-span-2">
          <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">Support</h2>
            <p class="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              For order issues, fastest answers live in our
              <a routerLink="/faq" class="font-medium text-primary-700 hover:underline dark:text-primary-300">FAQ</a>.
            </p>
          </div>
          <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">Email</h2>
            <p class="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              <a href="mailto:hello@atelier.dev" class="font-medium text-primary-700 hover:underline dark:text-primary-300">hello@atelier.dev</a>
            </p>
          </div>
          <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">Hours</h2>
            <p class="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              Monday–Friday, 9:00–17:00.<br />We reply within one business day.
            </p>
          </div>
        </aside>
      </div>
    </div>
  `,
})
export class ContactComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success('Message sent — we\'ll be in touch soon.');
    this.form.reset();
  }
}
